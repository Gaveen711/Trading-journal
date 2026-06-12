# Production Operations & Maintenance Guide — xaujournal

This document provides guidelines for maintaining, monitoring, and scaling the **xaujournal** Pro Trade Intelligence Terminal in its production environment using **Option A (Serverless Hybrid: Vercel + Firebase)**.

---

## 1. Secrets Management & Rotation Plan

In production, keeping credentials secure and rotating them regularly is a core security requirement.

### 🔑 Secret References

The application utilizes the following credentials:

| Secret Name | Platform | Used By | Rotation Interval |
|-------------|----------|---------|-------------------|
| `METAAPI_TOKEN` | Vercel & Firebase | Broker Sync API & Cloud Functions | Annually / On compromise |
| `RESEND_API_KEY` | Vercel | Hono API (emails/alerts) | 6 Months |
| `PADDLE_API_KEY` | Vercel | Hono API (billing webhook/API) | 6 Months |
| `FIREBASE_TOKEN` | GitHub Secrets | CI/CD (Firebase deployments) | 3 Months |
| `VERCEL_TOKEN` | GitHub Secrets | CI/CD (Vercel deployments) | 3 Months |
| `VERCEL_ORG_ID` | GitHub Secrets | CI/CD (Vercel build linking) | Permanent |
| `VERCEL_PROJECT_ID` | GitHub Secrets | CI/CD (Vercel build linking) | Permanent |

### 🔄 Rotation Steps

#### A. Firebase Admin SDK / Service Account Rotation
If you suspect the Firebase deployment key is compromised:
1. Go to **Google Cloud Console** → **IAM & Admin** → **Service Accounts**.
2. Locate the Firebase Admin SDK service account (usually `firebase-adminsdk-...`).
3. Click on **Keys** → **Add Key** → **Create New Key (JSON)**.
4. Download the JSON file and encode it as Base64.
5. Update the `FIREBASE_SERVICE_ACCOUNT` environment variable inside your Vercel project configuration.
6. Delete the old compromised key from Google Cloud Console.

#### B. MetaApi Cloud Token Rotation
1. Log in to [MetaApi Cloud Dashboard](https://app.metaapi.cloud).
2. Generate a new API token.
3. Update Vercel environment variables: Set `METAAPI_TOKEN` to the new token.
4. Update Firebase Cloud Functions secrets:
   ```bash
   firebase functions:secrets:set META_API_TOKEN="new_token_here"
   ```
5. Deploy functions to apply the secret change:
   ```bash
   firebase deploy --only functions
   ```

---

## 2. Production Monitoring & Logging Setup

To ensure 99.9% uptime, configure active logging, performance monitoring, and incident alerting.

### 📊 Client & API Telemetry (Vercel)
1. **Speed Insights**: Enable **Vercel Speed Insights** in the Vercel dashboard. This tracks client-side Core Web Vitals (LCP, FID, CLS) in real-time.
2. **Web Analytics**: Enable **Vercel Analytics** to monitor traffic spikes and geographical distribution of users.
3. **API Log Streams**: Set up a log drain from Vercel to a log management service (like Datadog, Axiom, or Logflare) to capture Hono backend execution times and `5xx` errors.

### 🪵 Backend & Database Logs (Google Cloud Console)
Firestore reads, writes, and Firebase Cloud Function invocations are logged inside the **Google Cloud Logging (Winston/Stackdriver)** suite.
* Go to the GCP console under **Logging** → **Log Explorer**.
* Filter for `resource.type="cloud_function"` to view broker sync logs.
* Monitor function execution times and timeout alerts. (Note: MetaApi RPC calls have a timeout configuration of **540 seconds** in `functions/index.js` to accommodate heavy MT4/MT5 historical sync operations).

### 🔔 Alerting Thresholds
Create alert notifications (via Email or Slack) in Google Cloud and Vercel dashboards for the following thresholds:
1. **Cloud Firestore Quota**: Trigger an alert when Firestore reads or writes reach 80% of daily free tier or expected paid budget limits.
2. **Execution Failures**: Alert if Firebase Cloud Function error rate exceeds 2% in a 10-minute window.
3. **HTTP 5xx Spikes**: Alert if Vercel functions return `500 Internal Server Error` on more than 1% of total edge requests.
4. **Billing Alerts**: Set up budget alerts on Vercel ($10-$50 soft limit) and Google Cloud Billing console to avoid runaway costs.

---

## 3. Reliability & Downtime Mitigation

### 🔄 Zero-Downtime Deployments (Blue-Green)
* **Vercel**: Vercel automatically deploys every Git push to a unique immutable preview URL. When merging to `main`, Vercel builds the project and swaps production traffic to the new build instantaneously. This provides out-of-the-box Blue-Green deployment safety.
* **Rollbacks**: If a bug is detected in production, go to Vercel dashboard → **Deployments** → Locate the previous working build → Click **Rollback**. The change is instant (takes less than 1 second) and requires no rebuilding.

### 🛡️ Third-Party API Circuit Breakers
If external APIs (MetaApi, Resend, Paddle) experience an outage:
* **Resend email alerts**: If Resend fails, we log the error but allow the user login flow to succeed (avoiding blocking the user due to email server issues).
* **MetaApi Broker Sync**: Sync failures do not block the user interface. If a sync fails, we mark `lastSyncStatus = "failed"` in Firestore and output a helpful message in the UI, allowing the user to retry manually.

---

## 4. Scaling Optimization

### 📈 Database Sizing & Concurrency
* **Firestore Scaling**: Firestore handles scaling automatically (capable of millions of concurrent connections). To reduce database reads and cost:
  1. We cache active API keys using Vercel KV (Redis).
  2. The frontend uses a real-time snapshot listener (`onSnapshot`) which caches reads client-side, avoiding reading the database on every page view.
* **Batch Operations**: For trade synchronization, the application implements chunked database writes using `db.batch()` in blocks of 500 documents. This ensures we stay within Firestore write limitations and optimizes transactional throughput.

---

## 5. Emergency Manual Deployments

If the CI/CD pipeline fails, you can deploy the application manually using the CLIs.

### Deploy Frontend & Hono API (Vercel)
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Authenticate and link project
vercel login
vercel link

# Deploy to production
vercel --prod
```

### Deploy Cloud Functions & Rules (Firebase)
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy --only functions,firestore:rules,storage
```
