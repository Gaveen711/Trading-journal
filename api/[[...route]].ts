import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { secureHeaders } from 'hono/secure-headers'
import crypto from 'crypto'

// Import shared helpers (using JS files under /api)
// @ts-ignore
import { admin, db as _db, initAdmin, now } from './_firebase.js'
const db: any = _db
// @ts-ignore
import resend from './_resend.js'
// @ts-ignore
// Dynamic imports used where needed to prevent metaapi.cloud-sdk from crashing the edge/serverless runtime on load

// Ensure Firebase is initialized before any routes execute
initAdmin()

type Env = {}
type Variables = Record<string, unknown>

export const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath('/api')

// ── Secure Headers Middleware ──────────────────────────────────────────────
app.use('*', secureHeaders())

// ── CORS Middleware ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://xaujournal.vercel.app',
  'https://www.xaujournal.com',
  'https://xaujournal.com',
  'http://localhost:5173',
]
if (process.env.ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.ALLOWED_ORIGIN)
}

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin')
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  }
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Api-Key, x-api-key')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204 as any)
  }
  await next()
})

// ── Rate Limiting Middleware ─────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
let lastCleanup = Date.now()

const cleanupExpiredLimits = () => {
  const now = Date.now()
  if (now - lastCleanup < 5 * 60 * 1000) return // Limit cleanup to once every 5 minutes
  lastCleanup = now
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}

app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    return await next()
  }

  cleanupExpiredLimits()

  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() || c.req.header('x-real-ip') || '127.0.0.1'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 100 // Maximum 100 requests per window

  const limitData = rateLimitMap.get(ip)
  if (!limitData || now > limitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
  } else {
    limitData.count++
    if (limitData.count > maxRequests) {
      c.header('Retry-After', Math.ceil((limitData.resetTime - now) / 1000).toString())
      return c.json({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' }, 429)
    }
  }

  const currentLimit = rateLimitMap.get(ip)
  if (currentLimit) {
    c.header('X-RateLimit-Limit', maxRequests.toString())
    c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - currentLimit.count).toString())
    c.header('X-RateLimit-Reset', Math.ceil(currentLimit.resetTime / 1000).toString())
  }

  await next()
})

// ── Shared plan guard ────────────────────────────────────────────────────────
function isSyncAllowed(userData: any) {
  const { plan, planExpiry, graceUntil } = userData || {}
  const nowMs = Date.now()
  if (plan === 'pro') {
    if (!planExpiry) return true; // Lifetime pro or missing expiry
    if (new Date(planExpiry).getTime() > nowMs) return true;
  }
  if (graceUntil && new Date(graceUntil).getTime() > nowMs) return true
  return false
}

// ── 1. Auth Utils Route ──────────────────────────────────────────────────────
app.post('/auth-utils', async (c) => {
  const action = c.req.query('action')
  if (action === 'login-alert') {
    try {
      const authHeader = c.req.header('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorised' }, 401)
      }
      const token = authHeader.split('Bearer ')[1]
      const decoded = await admin.auth().verifyIdToken(token)
      const email = decoded.email
      if (!email) {
        return c.json({ error: 'Email not found' }, 400)
      }
      try {
        await resend.emails.send({
          from: 'xaujournal <security@xaujournal.com>',
          to: email,
          subject: 'Security Alert: New Login Detected',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0d0d14; color: #ffffff; border-radius: 24px; border: 1px solid #ffffff10;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 8px; color: #facc15;">SECURITY ALERT</h1>
              <p style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 32px;">New Terminal Access Detected</p>
              <p style="font-size: 16px; line-height: 1.6; color: #ffffff;">We detected a new sign-in to your xaujournal account.</p>
              <div style="margin: 32px 0; padding: 24px; background: #1a1a24; border-radius: 16px; border: 1px solid #ffffff05;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Access Details</p>
                <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Time:</strong> ${new Date().toUTCString()}</p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.6;">If this was you, you can safely ignore this message. If you do not recognise this activity, please reset your password immediately.</p>
              <p style="margin-top: 40px; font-size: 12px; color: #475569; border-top: 1px solid #ffffff10; padding-top: 20px;">SECURED BY XAUJOURNAL INFRASTRUCTURE.</p>
            </div>
          `
        })
      } catch (emailErr: any) {
        console.error('Email Send Failed (Resend):', emailErr.message)
      }
      return c.json({ success: true })
    } catch (err) {
      console.error('Login Alert Error:', err)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }

  if (action === 'recaptcha') {
    let body;
    try {
      body = await c.req.json()
    } catch {
      return c.json({ valid: true, score: null })
    }
    const { token, recaptchaAction } = body
    if (!token) return c.json({ valid: true, score: null })

    try {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'xaujournal-0429'
      const response = await fetch(
        `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: { token, siteKey: process.env.VITE_RECAPTCHA_SITE_KEY || '6LfSRMosAAAAAJkpsSHRweUx48z1amorEE2Abqe7', expectedAction: recaptchaAction }
          })
        }
      )

      const data: any = await response.json()
      const score = data?.riskAnalysis?.score ?? 1
      const valid = data?.tokenProperties?.valid ?? true
      const blocked = valid && score < 0.5

      console.log(`reCAPTCHA: action=${recaptchaAction}, score=${score}, valid=${valid}`)
      return c.json({ valid, score, blocked })
    } catch (err) {
      console.error('reCAPTCHA assessment error:', err)
      return c.json({ valid: true, score: null, blocked: false })
    }
  }

  return c.json({ error: 'Unknown action' }, 400)
})

// ── 2. Broker Login Sync Route ──────────────────────────────────────────────
app.post('/broker-login-sync', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return c.json({ error: 'Missing Authorization header' }, 401)

  let uid: string
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  const user = await db.collection('users').doc(uid).get()
  if (!user.exists) {
    return c.json({ error: 'User not found' }, 404)
  }

  const userData = user.data()
  if (!isSyncAllowed(userData)) {
    return c.json({ error: 'Broker sync requires active Pro subscription' }, 403)
  }

  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { action } = body

  if (action === 'add') {
    const { login, password, server, brokerType, accountName } = body
    if (!login || !password || !server || !brokerType) {
      return c.json({ error: 'Missing required: login, password, server, brokerType' }, 400)
    }
    if (!['mt4', 'mt5'].includes(brokerType)) {
      return c.json({ error: 'brokerType must be mt4 or mt5' }, 400)
    }

    try {
      const { provisionMetaApiAccount, fetchBrokerTrades } = await import('./_metaapi-broker.js')
      const metaApiAccountId = await provisionMetaApiAccount({ login, password, server, brokerType })
      const testResult = await fetchBrokerTrades({ metaApiAccountId }, null)
      const brokerRef = db.collection('users').doc(uid).collection('brokerAccounts').doc()

      await brokerRef.set({
        id: brokerRef.id,
        accountName: accountName || `${brokerType.toUpperCase()}-${server}`,
        brokerType,
        server,
        login,
        metaApiAccountId,
        isActive: true,
        lastSyncTime: null,
        lastSyncStatus: 'pending',
        tradeCount: testResult.length,
        createdAt: now(),
        updatedAt: now(),
      })

      return c.json({
        ok: true,
        message: 'Broker account added successfully',
        accountId: brokerRef.id,
        tradeCount: testResult.length,
      })
    } catch (error: any) {
      console.error('[broker-login-sync] Add account error:', error.message)
      if (error.message.includes('Invalid') || error.message.includes('Authentication') || error.message.includes('password')) {
        return c.json({ error: 'Invalid broker credentials. Please check your login, password, and server.' }, 401)
      }
      return c.json({ error: `Failed to connect to broker: ${error.message}` }, 500)
    }
  }

  if (action === 'sync') {
    const { accountId } = body
    if (!accountId) return c.json({ error: 'Missing accountId' }, 400)

    try {
      const accountRef = db.collection('users').doc(uid).collection('brokerAccounts').doc(accountId)
      const accountSnap = await accountRef.get()
      if (!accountSnap.exists) return c.json({ error: 'Broker account not found' }, 404)

      const account = accountSnap.data()

      const { fetchBrokerTrades } = await import('./_metaapi-broker.js')
      const brokerTrades = await fetchBrokerTrades(
        {
          metaApiAccountId: account.metaApiAccountId,
          login: account.login,
          server: account.server,
          brokerType: account.brokerType,
        },
        account.lastSyncTime?.toDate ? account.lastSyncTime.toDate() : account.lastSyncTime ? new Date(account.lastSyncTime) : null
      )

      let newTradesCount = 0
      let updatedTradesCount = 0
      const tradesRef = db.collection('users').doc(uid).collection('trades')

      const refs = brokerTrades.map((trade: any) => {
        const tradeDocId = `broker_${account.id}_${trade.closeDealTicket}`
        return tradesRef.doc(tradeDocId)
      })

      const snapshots = refs.length > 0 ? await db.getAll(...refs) : []
      const existingMap = new Map()
      snapshots.forEach((snap: any) => {
        if (snap.exists) {
          existingMap.set(snap.id, snap.data())
        }
      })

      const CHUNK_SIZE = 500
      for (let i = 0; i < brokerTrades.length; i += CHUNK_SIZE) {
        const chunk = brokerTrades.slice(i, i + CHUNK_SIZE)
        const batch = db.batch()
        let chunkWrites = 0

        for (const trade of chunk) {
          const tradeDocId = `broker_${account.id}_${trade.closeDealTicket}`
          const tradeRef = tradesRef.doc(tradeDocId)
          const exists = existingMap.has(tradeDocId)
          const tradeData = {
            ...trade,
            accountId: account.id,
            syncedAt: now(),
            updatedAt: now(),
          }

          if (!exists) {
            (tradeData as any).createdAt = now()
            newTradesCount++
          } else {
            updatedTradesCount++
          }
          batch.set(tradeRef, tradeData, { merge: true })
          chunkWrites++
        }

        if (chunkWrites > 0) {
          await batch.commit()
        }
      }
      await accountRef.update({
        lastSyncTime: now(),
        lastSyncStatus: 'success',
        tradeCount: brokerTrades.length,
        updatedAt: now(),
      })

      return c.json({
        ok: true,
        message: 'Broker trades synced successfully',
        newTrades: newTradesCount,
        updatedTrades: updatedTradesCount,
        totalFetched: brokerTrades.length,
      })
    } catch (error: any) {
      console.error('[broker-login-sync] Sync error:', error.message)
      try {
        const accountRef = db.collection('users').doc(uid).collection('brokerAccounts').doc(accountId)
        await accountRef.update({
          lastSyncStatus: 'failed',
          lastSyncError: error.message,
          updatedAt: now(),
        })
      } catch (updateErr: any) {
        console.error('[broker-login-sync] Failed to update error status:', updateErr.message)
      }
      return c.json({ error: 'Sync failed', message: error.message }, 500)
    }
  }

  if (action === 'list') {
    try {
      const snapshot = await db.collection('users').doc(uid).collection('brokerAccounts').where('isActive', '==', true).get()
      const accounts = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          accountName: data.accountName,
          brokerType: data.brokerType,
          server: data.server,
          login: data.login,
          isActive: data.isActive,
          lastSyncTime: data.lastSyncTime,
          lastSyncStatus: data.lastSyncStatus,
          tradeCount: data.tradeCount,
          createdAt: data.createdAt,
        }
      })
      return c.json({ accounts })
    } catch (error) {
      return c.json({ error: 'Failed to list accounts' }, 500)
    }
  }

  if (action === 'remove') {
    const { accountId } = body
    if (!accountId) return c.json({ error: 'Missing accountId' }, 400)
    try {
      const accountRef = db.collection('users').doc(uid).collection('brokerAccounts').doc(accountId)
      const accountSnap = await accountRef.get()
      if (accountSnap.exists) {
        const accountData = accountSnap.data()
        if (accountData.metaApiAccountId) {
          try {
            const { deleteMetaApiAccount } = await import('./_metaapi-broker.js')
            await deleteMetaApiAccount(accountData.metaApiAccountId)
          } catch (metaApiErr: any) {
            console.error('[broker-login-sync] Failed to delete MetaApi account:', metaApiErr.message || metaApiErr)
          }
        }
      }

      await accountRef.update({
        isActive: false,
        updatedAt: now(),
      })
      return c.json({ ok: true, message: 'Broker account removed' })
    } catch (error) {
      return c.json({ error: 'Failed to remove account' }, 500)
    }
  }

  return c.json({ error: 'Method not allowed' }, 405)
})

// ── 3. Connect Broker Route ──────────────────────────────────────────────────
app.post('/connect-broker', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return c.json({ error: 'Missing Authorization header' }, 401)

  let uid: string
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch (err: any) {
    console.error('[connect-broker] verifyIdToken failed:', err?.message || err)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { server, accountId, password, platform = 'mt5' } = body
  if (!server || !accountId || !password) {
    return c.json({ error: 'Missing server, accountId, or password' }, 400)
  }

  const brokerType = platform === 'mt4' ? 'mt4' : 'mt5'

  try {
    const userDoc = await db.collection('users').doc(uid).get()
    const userData = userDoc.data() || {}
    if (!isSyncAllowed(userData)) {
      return c.json({
        error: 'Pro subscription required',
        message: 'Broker connect is a Pro feature.',
      }, 403)
    }

    const { provisionMetaApiAccount, fetchMetaApiDeals } = await import('./_metaapi-broker.js')
    const metaApiAccountId = await provisionMetaApiAccount({ login: accountId, password, server, brokerType })
    const deals = await fetchMetaApiDeals(metaApiAccountId)

    const brokerRef = db.collection('users').doc(uid).collection('brokerAccounts').doc()
    await brokerRef.set({
      id: brokerRef.id,
      accountName: `${server} · ${accountId}`,
      brokerType,
      server,
      login: String(accountId),
      metaApiAccountId,
      isActive: true,
      lastSyncTime: now(),
      lastSyncStatus: 'success',
      tradeCount: deals.length,
      createdAt: now(),
      updatedAt: now(),
    })

    const tradesRef = db.collection('users').doc(uid).collection('trades')
    const batch = db.batch()
    let stored = 0
    for (const trade of deals) {
      const tradeDocId = `broker_${brokerRef.id}_${trade.closeDealTicket}`
      batch.set(tradesRef.doc(tradeDocId), { ...trade, accountId: brokerRef.id, syncedAt: now(), createdAt: now(), updatedAt: now() }, { merge: true })
      stored++
    }
    if (stored > 0) await batch.commit()

    return c.json({
      message: `Connected to ${server}. Synced ${deals.length} closed deal(s).`,
      accountId: brokerRef.id,
      metaApiAccountId,
      tradeCount: deals.length,
    })
  } catch (err: any) {
    console.error('[connect-broker]', err.message)
    const msg = err.message || 'Failed to connect broker'
    if (/invalid|auth|credential|password|login/i.test(msg)) {
      return c.json({ error: 'Invalid broker credentials. Check login, password, and server name.' }, 401)
    }
    return c.json({ error: msg }, 500)
  }
})

// ── 4. Generate API Key Route ────────────────────────────────────────────────
app.post('/generate-api-key', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return c.json({ error: 'Missing Authorization header' }, 401)

  let uid: string
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch (err: any) {
    console.error('[generate-api-key] verifyIdToken failed:', err?.message || err)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get()
    const userData = userDoc.data() || {}

    if (!isSyncAllowed(userData)) {
      return c.json({
        error: 'Pro subscription required',
        message: 'MT5/TradingView Auto-Sync is a Pro feature. Upgrade to generate an API key.',
      }, 403)
    }

    const existing = await db.collection('apiKeys').where('uid', '==', uid).limit(1).get()
    if (!existing.empty) {
      return c.json({ apiKey: existing.docs[0].id })
    }

    const apiKey = 'xau_' + crypto.randomBytes(24).toString('hex')
    await db.collection('apiKeys').doc(apiKey).set({
      uid,
      label: 'MT5/TradingView Sync Key',
      createdAt: now(),
    })

    await db.collection('users').doc(uid).set(
      { mt5SyncEnabled: true, syncKeyCreatedAt: now() },
      { merge: true }
    )

    console.log(`[generate-api-key] New key created for uid=${uid}`)
    return c.json({ apiKey })
  } catch (err: any) {
    console.error('[generate-api-key] Error:', err.message)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
  }
})

// ── 5. Revoke API Key Route ──────────────────────────────────────────────────
app.post('/revoke-api-key', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return c.json({ error: 'Missing Authorization header' }, 401)

  let uid: string
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch (err: any) {
    console.error('[revoke-api-key] verifyIdToken failed:', err?.message || err)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  try {
    const snapshot = await db.collection('apiKeys').where('uid', '==', uid).get()
    if (snapshot.empty) {
      return c.json({ success: true, message: 'No active key to revoke' })
    }

    const batch = db.batch()
    snapshot.docs.forEach((doc: any) => batch.delete(doc.ref))
    await batch.commit()

    await db.collection('users').doc(uid).update({ mt5SyncEnabled: false })

    console.log(`[revoke-api-key] Key(s) revoked for uid=${uid}`)
    return c.json({ success: true })
  } catch (err: any) {
    console.error('[revoke-api-key] Error:', err.message)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
  }
})

// ── 6. Paddle Checkout Verification Route ────────────────────────────────────
app.post('/paddle-success', async (c) => {
  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { transactionId, planType = 'pro_monthly', userId } = body
  if (!transactionId || !userId) {
    return c.json({ error: 'Missing required validation parameters.' }, 400)
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing token.' }, 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    initAdmin()
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialised.')
    }

    const decodedToken = await admin.auth().verifyIdToken(token)
    if (decodedToken.uid !== userId) {
      return c.json({ error: 'Forbidden: User ID mismatch.' }, 403)
    }

    // Verify transaction with Paddle Billing API
    const isSandbox = (process.env.VITE_PADDLE_ENVIRONMENT || 'sandbox').toLowerCase() === 'sandbox';
    const paddleApiUrl = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
    const paddleApiKey = process.env.PADDLE_API_KEY;

    if (!paddleApiKey) {
      throw new Error('Server configuration error: Missing Paddle API Key.');
    }

    const paddleResponse = await fetch(`${paddleApiUrl}/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`
      }
    });

    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text();
      throw new Error(`Failed to verify transaction with Paddle: ${errorText}`);
    }

    const paddleData: any = await paddleResponse.json();
    const transaction = paddleData.data;

    if (!transaction) {
      throw new Error('Invalid transaction response from Paddle.');
    }

    // Validate transaction details
    const status = transaction.status?.toLowerCase();
    if (status !== 'completed' && status !== 'billed') {
      return c.json({ error: `Transaction is not completed. Status: ${transaction.status}` }, 400);
    }

    const transactionUserId = transaction.custom_data?.userId;
    const transactionPlanType = transaction.custom_data?.planType;

    if (transactionUserId !== userId) {
      return c.json({ error: 'Forbidden: Transaction user ID mismatch.' }, 403);
    }

    const planExpiryDefault = new Date();
    planExpiryDefault.setDate(planExpiryDefault.getDate() + 7); // Default fallback

    const subscriptionId = transaction.subscription_id;
    let isTrial = true;
    let planExpiry = planExpiryDefault;

    if (subscriptionId) {
      try {
        const subResponse = await fetch(`${paddleApiUrl}/subscriptions/${subscriptionId}`, {
          headers: {
            'Authorization': `Bearer ${paddleApiKey}`
          }
        });
        if (subResponse.ok) {
          const subData: any = await subResponse.json();
          const subscription = subData.data;
          if (subscription) {
            isTrial = subscription.status === 'trialing';
            if (subscription.next_billed_at) {
              planExpiry = new Date(subscription.next_billed_at);
            }
          }
        } else {
          console.warn(`[paddle-success] Failed to fetch subscription ${subscriptionId}:`, subResponse.statusText);
        }
      } catch (subErr: any) {
        console.error('[paddle-success] Error fetching subscription details:', subErr.message || subErr);
      }
    }

    await db.collection('users').doc(userId).set({
      plan: 'pro',
      isTrial,
      planExpiry: planExpiry.toISOString(),
      paddleTransactionId: transactionId,
      paddleSubscriptionId: subscriptionId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return c.json({ success: true, planExpiry: planExpiry.toISOString(), isTrial });
  } catch (error: any) {
    console.error('[paddle-success] error:', error.message || error);
    return c.json({ error: `Paddle verification failed: ${error.message || 'unknown error'}` }, 500);
  }
})

// ── 8. Save Trade Route ──────────────────────────────────────────────────────
app.post('/save-trade', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return c.json({ error: 'Missing Authorization header' }, 401)

  let uid: string
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch (err: any) {
    console.error('[save-trade] verifyIdToken failed:', err.message)
    return c.json({ error: 'Invalid or expired token', details: err.message }, 401)
  }

  try {
    let tradeData;
    try {
      tradeData = await c.req.json()
    } catch {
      return c.json({ error: 'Missing trade data payload' }, 400)
    }

    if (!tradeData) {
      return c.json({ error: 'Missing trade data payload' }, 400)
    }

    const userDoc = await db.collection('users').doc(uid).get()
    const plan = userDoc.exists ? (userDoc.data().plan || 'free') : 'free'

    if (plan !== 'pro') {
      const tradesSnap = await db.collection('users').doc(uid).collection('trades').count().get()
      if (tradesSnap.data().count >= 50) {
        return c.json({
          error: 'Free tier limit reached (50 trades). Upgrade to Pro.',
          code: 'limit-reached'
        }, 403)
      }
    }

    const tradeColRef = db.collection('users').doc(uid).collection('trades')
    const newTradeDoc = tradeColRef.doc()

    await Promise.all([
      newTradeDoc.set({
        ...tradeData,
        createdAt: now(),
        updatedAt: now()
      }),
      db.collection('users').doc(uid).set({
        totalTradesLogged: admin.firestore.FieldValue.increment(1)
      }, { merge: true })
    ])

    console.log(`[save-trade] New trade logged for uid=${uid}, tradeId=${newTradeDoc.id}`)
    return c.json({ id: newTradeDoc.id })
  } catch (err: any) {
    console.error('[save-trade] Error logging trade:', err.message)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
  }
})

// ── 9. Sync Trade Route ──────────────────────────────────────────────────────
async function resolveKey(apiKey: string) {
  if (!apiKey) return null
  const doc = await db.collection('apiKeys').doc(apiKey).get()
  if (!doc.exists) return null
  const uid = doc.data().uid
  if (!uid) return null

  const userDoc = await db.collection('users').doc(uid).get()
  if (!isSyncAllowed(userDoc.data())) return null

  return uid
}

async function handleOpenSync(tradeRef: any, payload: any) {
  const snap = await tradeRef.get()
  if (snap.exists) return { status: 'duplicate' }

  await tradeRef.set({
    positionId: payload.positionId,
    openDealTicket: payload.ticket || null,
    symbol: payload.symbol,
    direction: payload.direction,
    lots: Number(payload.lots) || 0,
    openPrice: Number(payload.price) || 0,
    openTime: payload.time,
    status: 'open',
    commission: Number(payload.commission) || 0,
    swap: Number(payload.swap) || 0,
    comment: payload.comment || '',
    source: payload.source || 'mt5',
    createdAt: now(),
    updatedAt: now(),
  })

  return { status: 'created', positionId: payload.positionId }
}

async function handleCloseSync(tradeRef: any, payload: any) {
  const snap = await tradeRef.get()
  const brokerPnl = Number(payload.profit) || 0
  const commission = Number(payload.commission) || 0
  const swap = Number(payload.swap) || 0
  const netPnl = brokerPnl + commission + swap

  const PIP_SIZE = 0.1
  let pips = null

  if (snap.exists) {
    const openPrice = snap.data().openPrice || 0
    const direction = snap.data().direction || payload.direction
    const closePrice = Number(payload.price) || 0
    const diff = direction === 'buy' ? closePrice - openPrice : openPrice - closePrice
    pips = Math.round(diff / PIP_SIZE)

    await tradeRef.update({
      closeDealTicket: payload.ticket || null,
      closePrice: Number(payload.price) || 0,
      closeTime: payload.time,
      pnl: brokerPnl,
      commission, swap, netPnl, pips,
      status: 'closed',
      updatedAt: now(),
    })
  } else {
    await tradeRef.set({
      positionId: payload.positionId,
      closeDealTicket: payload.ticket || null,
      symbol: payload.symbol,
      direction: payload.direction,
      lots: Number(payload.lots) || 0,
      closePrice: Number(payload.price) || 0,
      closeTime: payload.time,
      pnl: brokerPnl,
      commission, swap, netPnl,
      status: 'closed',
      partial: true,
      source: payload.source || 'mt5',
      createdAt: now(),
      updatedAt: now(),
    })
  }

  return { status: 'updated', positionId: payload.positionId, pnl: brokerPnl, pips }
}

app.post('/sync-trade', async (c) => {
  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const apiKey = c.req.header('x-api-key') || body?.apiKey
  const uid = await resolveKey(apiKey)
  if (!uid) return c.json({ error: 'Invalid API key or subscription expired' }, 403)

  const { event, positionId, symbol } = body
  if (!event || !positionId || !symbol) {
    return c.json({ error: 'Missing: event, positionId, symbol' }, 400)
  }

  if (body.comment && typeof body.comment === 'string' && body.comment.length > 500) {
    return c.json({ error: 'comment exceeds 500 characters' }, 400)
  }
  if (symbol && typeof symbol === 'string' && symbol.length > 20) {
    return c.json({ error: 'invalid symbol' }, 400)
  }

  const tradeRef = db.collection('users').doc(uid).collection('trades').doc(`pos_${positionId}`)

  let result
  try {
    if (event === 'open') result = await handleOpenSync(tradeRef, body)
    else if (event === 'close') result = await handleCloseSync(tradeRef, body)
    else return c.json({ error: `Unknown event: ${event}` }, 400)
  } catch (err: any) {
    console.error('[sync-trade] Firestore error:', err.message)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
  }

  console.log(`[sync-trade] uid=${uid} event=${event} pos=${positionId}`, result)
  return c.json(result)
})

// ── 10. Trades Route ─────────────────────────────────────────────────────────
// Legacy /trades endpoint removed (HIGH-01)

// ── 10b. Reset Trades Route ──────────────────────────────────────────────────
app.post('/reset-trades', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return c.json({ error: 'Missing Authorization header' }, 401)

  let uid: string
  try {
    initAdmin()
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch (err: any) {
    console.error('[reset-trades] verifyIdToken failed:', err.message)
    return c.json({ error: 'Invalid or expired token', details: err.message }, 401)
  }

  try {
    const auditRef = db.collection('users').doc(uid).collection('auditLogs').doc()
    await auditRef.set({
      action: 'RESET_TRADES',
      confirmedAt: now(),
      timestamp: new Date().toISOString(),
    })

    const tradesColRef = db.collection('users').doc(uid).collection('trades')
    const snapshot = await tradesColRef.get()

    if (!snapshot.empty) {
      const batch = db.batch()
      snapshot.docs.forEach((doc: any) => batch.delete(doc.ref))
      await batch.commit()
    }

    await db.collection('users').doc(uid).set({
      totalTradesLogged: 0
    }, { merge: true })

    console.log(`[reset-trades] Wiped trades for uid=${uid}`)
    return c.json({ success: true, message: 'All trades reset successfully.' })
  } catch (err: any) {
    console.error('[reset-trades] Error resetting trades:', err.message)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
  }
})

// ── 11. TradingView Webhook Route ────────────────────────────────────────────
async function handleOpenTv(tradeRef: any, payload: any) {
  const snap = await tradeRef.get()
  if (snap.exists) return { status: 'duplicate' }

  await tradeRef.set({
    positionId: payload.positionId,
    symbol: payload.symbol,
    direction: payload.direction,
    lots: Number(payload.lots) || 0,
    openPrice: Number(payload.price) || 0,
    openTime: payload.time,
    status: 'open',
    commission: 0,
    swap: 0,
    comment: payload.comment || '',
    source: 'tradingview',
    createdAt: now(),
    updatedAt: now(),
  })

  return { status: 'created', positionId: payload.positionId }
}

async function handleCloseTv(tradeRef: any, payload: any) {
  const snap = await tradeRef.get()
  const brokerPnl = Number(payload.profit) || 0
  const commission = Number(payload.commission) || 0
  const swap = Number(payload.swap) || 0
  const netPnl = brokerPnl + commission + swap

  const PIP_SIZE = 0.1
  let pips = null

  if (snap.exists) {
    const openPrice = snap.data().openPrice || 0
    const direction = snap.data().direction || payload.direction
    const closePrice = Number(payload.price) || 0
    const diff = direction === 'buy' ? closePrice - openPrice : openPrice - closePrice
    pips = Math.round(diff / PIP_SIZE)

    await tradeRef.update({
      closePrice: Number(payload.price) || 0,
      closeTime: payload.time,
      pnl: brokerPnl,
      commission, swap, netPnl, pips,
      status: 'closed',
      updatedAt: now(),
    })
  } else {
    await tradeRef.set({
      positionId: payload.positionId,
      symbol: payload.symbol,
      direction: payload.direction,
      lots: Number(payload.lots) || 0,
      closePrice: Number(payload.price) || 0,
      closeTime: payload.time,
      pnl: brokerPnl,
      commission, swap, netPnl,
      status: 'closed',
      partial: true,
      source: 'tradingview',
      createdAt: now(),
      updatedAt: now(),
    })
  }

  return { status: 'updated', positionId: payload.positionId, pnl: brokerPnl, pips }
}

app.post('/tv-webhook', async (c) => {
  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const apiKey = body?.apiKey || c.req.header('x-api-key')
  const uid = await resolveKey(apiKey)
  if (!uid) return c.json({ error: 'Invalid API key or subscription expired' }, 403)

  const { event, positionId, symbol } = body
  if (!event || !positionId || !symbol) {
    return c.json({ error: 'Missing: event, positionId, symbol' }, 400)
  }

  if (body.comment && typeof body.comment === 'string' && body.comment.length > 500) {
    return c.json({ error: 'comment exceeds 500 characters' }, 400)
  }
  if (symbol && typeof symbol === 'string' && symbol.length > 20) {
    return c.json({ error: 'invalid symbol' }, 400)
  }

  const tradeRef = db.collection('users').doc(uid).collection('trades').doc(`pos_${positionId}`)

  let result
  try {
    if (event === 'open') result = await handleOpenTv(tradeRef, body)
    else if (event === 'close') result = await handleCloseTv(tradeRef, body)
    else return c.json({ error: `Unknown event: ${event}` }, 400)
  } catch (err: any) {
    console.error('[tv-webhook] Firestore error:', err.message)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
  }

  console.log(`[tv-webhook] uid=${uid} event=${event} pos=${positionId}`, result)
  return c.json(result)
})

// ── 12. Webhook Route ────────────────────────────────────────────────────────
// Webhook temporarily disabled while migrating to Paddle

// ── 13. Cron Jobs ───────────────────────────────────────────────────────────
const handleBrokerSyncPoller = async (c: any) => {
  const cronSecret = c.req.header('x-cron-secret') || ''
  const expectedSecret = process.env.CRON_SECRET || ''
  const a = crypto.createHash('sha256').update(cronSecret).digest()
  const b = crypto.createHash('sha256').update(expectedSecret).digest()
  if (!crypto.timingSafeEqual(a, b)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  console.log('[broker-sync-poller] Starting scheduled broker sync...')

  let totalUsers = 0
  let totalAccounts = 0
  let successfulSyncs = 0
  let failedSyncs = 0

  try {
    const usersSnapshot = await db.collection('users').get()

    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id
      const userData = userDoc.data()

      const nowMs = Date.now()
      const isPro = userData.plan === 'pro' && 
                    userData.planExpiry && 
                    new Date(userData.planExpiry).getTime() > nowMs
      const isGrace = userData.graceUntil && 
                      new Date(userData.graceUntil).getTime() > nowMs

      if (!isPro && !isGrace) {
        continue
      }

      totalUsers++

      const accountsSnapshot = await db
        .collection('users').doc(uid)
        .collection('brokerAccounts')
        .where('isActive', '==', true)
        .get()

      for (const accountDoc of accountsSnapshot.docs) {
        const account = accountDoc.data()
        const accountId = accountDoc.id
        totalAccounts++

        try {
          if (account.lastSyncTime) {
            const lastSync = new Date(account.lastSyncTime).getTime()
            const timeSinceSync = Date.now() - lastSync
            if (timeSinceSync < 30000) {
              console.log(`[broker-sync-poller] Skipping ${accountId} - recently synced`)
              continue
            }
          }

          const { fetchBrokerTrades } = await import('./_metaapi-broker.js')
          const brokerTrades = await fetchBrokerTrades(
            {
              metaApiAccountId: account.metaApiAccountId,
              login: account.login,
              server: account.server,
              brokerType: account.brokerType,
            },
            (account.lastSyncTime ? new Date(account.lastSyncTime) : null) as any
          )

          const tradesRef = db.collection('users').doc(uid).collection('trades')
          const refs = brokerTrades.map((trade: any) => {
            const tradeDocId = `broker_${accountId}_${trade.closeDealTicket}`
            return tradesRef.doc(tradeDocId)
          })

          const snapshots = refs.length > 0 ? await db.getAll(...refs) : []
          const existingMap = new Map()
          snapshots.forEach((snap: any) => {
            if (snap.exists) {
              existingMap.set(snap.id, snap.data())
            }
          })

          let newCount = 0
          const CHUNK_SIZE = 500
          for (let i = 0; i < brokerTrades.length; i += CHUNK_SIZE) {
            const chunk = brokerTrades.slice(i, i + CHUNK_SIZE)
            const batch = db.batch()
            let chunkWrites = 0

            for (const trade of chunk) {
              const tradeDocId = `broker_${accountId}_${trade.closeDealTicket}`
              const tradeRef = tradesRef.doc(tradeDocId)
              const exists = existingMap.has(tradeDocId)

              if (!exists) {
                newCount++
              }

              batch.set(tradeRef, {
                ...trade,
                accountId,
                syncedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...(exists ? {} : { createdAt: new Date().toISOString() }),
              }, { merge: true })
              chunkWrites++
            }

            if (chunkWrites > 0) {
              await batch.commit()
            }
          }

          const accountRef = db
            .collection('users').doc(uid)
            .collection('brokerAccounts')
            .doc(accountId)

          await accountRef.update({
            lastSyncTime: new Date().toISOString(),
            lastSyncStatus: 'success',
            tradeCount: brokerTrades.length,
            updatedAt: new Date().toISOString(),
          })

          console.log(`[broker-sync-poller] ✓ Synced ${newCount} new trades for ${accountId}`)
          successfulSyncs++
        } catch (error: any) {
          console.error(`[broker-sync-poller] ✗ Failed to sync ${accountId}:`, error.message)
          
          try {
            const accountRef = db
              .collection('users').doc(uid)
              .collection('brokerAccounts')
              .doc(accountId)

            await accountRef.update({
              lastSyncStatus: 'failed',
              lastSyncError: error.message,
              updatedAt: new Date().toISOString(),
            })
          } catch (updateErr: any) {
            console.error('[broker-sync-poller] Failed to update error status:', updateErr.message)
          }

          failedSyncs++
        }
      }
    }

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      usersProcessed: totalUsers,
      accountsProcessed: totalAccounts,
      successfulSyncs,
      failedSyncs,
    }

    console.log('[broker-sync-poller] Completed:', result)
    return c.json(result)
  } catch (error: any) {
    console.error('[broker-sync-poller] Fatal error:', error.message)
    return c.json({
      error: 'Cron job failed',
      message: error.message,
    }, 500)
  }
}
app.get('/cron/broker-sync-poller', handleBrokerSyncPoller)
app.post('/cron/broker-sync-poller', handleBrokerSyncPoller)

const handleRemindExpiry = async (c: any) => {
  const providedAuth = c.req.header('Authorization') || ''
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  const providedHash = crypto.createHash('sha256').update(providedAuth).digest()
  const expectedHash = crypto.createHash('sha256').update(expectedAuth).digest()

  if (!crypto.timingSafeEqual(providedHash, expectedHash)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const nowTime = new Date()
    const threeDaysFromNow = new Date(nowTime.getTime() + (3 * 24 * 60 * 60 * 1000))
    const usersRef = db.collection('users')
    const snapshot = await usersRef.where('plan', '==', 'pro').get()

    const emailPromises: Promise<any>[] = []

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      if (!data.planExpiry || !data.email) return

      const expiryDate = new Date(data.planExpiry)

      if (expiryDate <= threeDaysFromNow && expiryDate > new Date(threeDaysFromNow.getTime() - 86400000)) {
        emailPromises.push(
          resend.emails.send({
            from: 'xaujournal <alerts@xaujournal.com>',
            to: data.email,
            subject: 'xaujournal: 3 Days Left of Pro',
            html: `<p>Hi ${data.name || 'Trader'}, your Pro access expires in 3 days. Renew now to avoid losing your advanced analytics.</p>`
          })
        )
      }
    })

    await Promise.all(emailPromises)
    return c.json({ success: true, sent: emailPromises.length })
  } catch (error: any) {
    console.error("Cron Error:", error)
    return c.json({ error: error.message }, 500)
  }
}
app.get('/cron/remind-expiry', handleRemindExpiry)
app.post('/cron/remind-expiry', handleRemindExpiry)

const handleRevokeExpired = async (c: any) => {
  const providedAuth = c.req.header('Authorization') || ''
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  const providedHash = crypto.createHash('sha256').update(providedAuth).digest()
  const expectedHash = crypto.createHash('sha256').update(expectedAuth).digest()

  if (!crypto.timingSafeEqual(providedHash, expectedHash)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const nowTime = new Date()
    const nowIso = nowTime.toISOString()

    const snapshot = await db.collection('users')
      .where('plan', '==', 'grace')
      .where('graceUntil', '<=', nowIso)
      .get()

    if (snapshot.empty) {
      console.log('[revoke-expired] No expired grace periods found.')
      return c.json({ success: true, revoked: 0 })
    }

    let revokedCount = 0

    for (const userDoc of snapshot.docs) {
      const uid = userDoc.id
      try {
        const keySnap = await db.collection('apiKeys').where('uid', '==', uid).get()
        const batch = db.batch()
        keySnap.docs.forEach((doc: any) => batch.delete(doc.ref))

        batch.update(db.collection('users').doc(uid), {
          plan: 'free',
          planExpiry: null,
          graceUntil: null,
          graceReason: null,
          mt5SyncEnabled: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        await batch.commit()
        revokedCount++
        console.log(`[revoke-expired] Revoked keys and downgraded uid=${uid}`)
      } catch (e: any) {
        console.error(`[revoke-expired] Failed for uid=${uid}:`, e.message)
      }
    }

    return c.json({ success: true, revoked: revokedCount })
  } catch (error: any) {
    console.error('[revoke-expired] Cron error:', error)
    return c.json({ error: error.message }, 500)
  }
}
app.get('/cron/revoke-expired', handleRevokeExpired)
app.post('/cron/revoke-expired', handleRevokeExpired)

// Export handlers for Vercel
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
