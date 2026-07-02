import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import crypto from 'crypto'
// @ts-ignore
import { admin, db as _db, initAdmin, now } from './_firebase.js'
const db: any = _db
// @ts-ignore
import resend from './_resend.js'

import { corsMiddleware, secureHeadersMiddleware, rateLimitMiddleware } from './_middleware.js'
import { isSyncAllowed, getUidFromContext, verifyIdToken } from './_auth.js'
// @ts-ignore
import { fetchBrokerTrades, provisionMetaApiAccount, fetchMetaApiDeals } from './_metaapi-broker.js'
import {
  resolveKey,
  invalidateUserCache,
  invalidateApiKeyCache,
  handleOpenTradeSync,
  handleCloseTradeSync
} from './_tradeService.js'
import { getClientIp } from './_ipUtils.js'
import { chunkedDbGetAll, runWithConcurrencyLimit } from './_firestoreUtils.js'
import { persistBrokerTrades, toDateOrNull } from './_brokerTradePersistence.js'

// Ensure Firebase is initialized before any routes execute
initAdmin()

// Helper to sanitize error messages and log full details server-side
function handleRouteError(route: string, err: any, c: any, customErrName = 'Internal Server Error') {
  console.error(`[${route}] Error:`, err)
  const constructorName = err?.constructor?.name
  const MSG_MAP: Record<string, string> = {
    'MetaApiError': 'Broker connection failed. Check your credentials.',
    'FirebaseError': 'Database operation failed. Try again.',
  }
  const safeMsg = MSG_MAP[constructorName] || 'An unexpected error occurred.'
  return c.json({ error: customErrName, message: safeMsg }, 500)
}

type Env = {}
type Variables = Record<string, unknown>

export const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath('/api')

// ── Middleware Registrations ────────────────────────────────────────────────
app.use('*', secureHeadersMiddleware)
app.use('*', corsMiddleware)
app.use('*', rateLimitMiddleware)

// ── 1. Authentication Utilities Route ────────────────────────────────────────
app.post('/auth-utils', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Missing body payload' }, 400)
  }

  const { action } = body

  if (action === 'send-login-alert') {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing token.' }, 401)
    }
    const token = authHeader.split('Bearer ')[1]
    
    let email: string
    try {
      const decodedToken = await verifyIdToken(token)
      email = decodedToken.email
      if (!email) {
        return c.json({ error: 'Email not found in token' }, 400)
      }
    } catch (err: any) {
      console.error('[send-login-alert] Auth verification failed:', err.message)
      return c.json({ error: 'Unauthorized: Invalid token' }, 401)
    }

    const ipAddress = getClientIp(c)
    const userAgent = body.userAgent || c.req.header('user-agent') || 'Unknown'
    const time = body.time || new Date().toUTCString()

    try {
      await resend.emails.send({
        from: 'XauJournal Security <security@xaujournal.com>',
        to: email,
        subject: 'XauJournal New Login Detected',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #f1f5f9; background: #0f172a; border-radius: 8px;">
            <h2 style="color: #38bdf8; margin-bottom: 20px;">New Login Alert</h2>
            <p>We detected a new login to your XauJournal account.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; width: 120px;">IP Address:</td>
                <td style="padding: 8px 0; font-weight: bold;">${ipAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Device/Browser:</td>
                <td style="padding: 8px 0; font-weight: bold;">${userAgent || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Time:</td>
                <td style="padding: 8px 0; font-weight: bold;">${time || new Date().toUTCString()}</td>
              </tr>
            </table>
            <p style="font-size: 13px; color: #64748b; line-height: 1.6;">If this was you, you can safely ignore this message. If you do not recognise this activity, please reset your password immediately.</p>
            <p style="margin-top: 40px; font-size: 12px; color: #475569; border-top: 1px solid #ffffff10; padding-top: 20px;">SECURED BY XAUJOURNAL INFRASTRUCTURE.</p>
          </div>
        `
      })
    } catch (emailErr: any) {
      console.error('Email Send Failed (Resend):', emailErr.message)
    }
    return c.json({ success: true })
  }

  if (action === 'recaptcha') {
    let body;
    try {
      body = await c.req.json()
    } catch {
      return c.json({ valid: false, score: 0, blocked: true, error: 'Invalid JSON body' })
    }
    const { token, recaptchaAction } = body
    if (!token) return c.json({ valid: false, score: 0, blocked: true, error: 'Missing token' })

    try {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'xaujournal29'
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

      if (!response.ok) {
        throw new Error(`reCAPTCHA API returned HTTP ${response.status}`)
      }

      const data: any = await response.json()
      const valid = data?.tokenProperties?.valid === true
      const score = data?.riskAnalysis?.score ?? 0
      const blocked = !valid || score < 0.5

      console.log(`reCAPTCHA: action=${recaptchaAction}, score=${score}, valid=${valid}, blocked=${blocked}`)
      return c.json({ valid, score, blocked })
    } catch (err) {
      console.error('reCAPTCHA assessment error:', err)
      return c.json({ valid: false, score: 0, blocked: true, error: 'reCAPTCHA validation failed' })
    }
  }

  return c.json({ error: 'Unknown action' }, 400)
})

app.post('/contact', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { name, email, subject, message } = body
  if (!name || !email || !message) {
    return c.json({ error: 'Missing required fields: name, email, and message' }, 400)
  }

  try {
    // 1. Save to Firestore
    await db.collection('contactMessages').add({
      name,
      email,
      subject: subject || 'No Subject',
      message,
      createdAt: now(),
    })

    // 2. Send email via Resend
    try {
      await resend.emails.send({
        from: 'XauJournal Contact Form<contact@xaujournal.com>',
        to: 'info@xaujournal.com',
        subject: `[Contact Form] ${subject || 'New Message'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2>New Contact Form Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 6px;">${message}</p>
          </div>
        `
      })
    } catch (emailErr: any) {
      console.error('[contact] Resend email failed:', emailErr.message)
    }

    return c.json({ success: true, message: 'Message sent successfully.' })
  } catch (err: any) {
    return handleRouteError('contact', err, c)
  }
})


// ── Helper to consolidate Broker Connection logic ───────────────────────────
async function consolidateBrokerConnect({
  uid,
  login,
  password,
  server,
  brokerType,
  accountName
}: any) {
  const metaApiAccountId = await provisionMetaApiAccount({ login, password, server, brokerType })
  const deals = await fetchMetaApiDeals(metaApiAccountId)

  const brokerRef = db.collection('users').doc(uid).collection('brokerAccounts').doc()
  const name = accountName || `${server} · ${login}`
  
  await brokerRef.set({
    id: brokerRef.id,
    accountName: name,
    brokerType,
    server,
    login: String(login),
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

  return {
    accountId: brokerRef.id,
    metaApiAccountId,
    tradeCount: deals.length,
  }
}

// ── Helper to handle Broker Addition logic ───────────────────────────
async function handleBrokerAdd(
  c: any,
  uid: string,
  { login, password, server, brokerType, accountName, legacyResponse = false }: any
) {
  try {
    const result = await consolidateBrokerConnect({
      uid,
      login,
      password,
      server,
      brokerType,
      accountName
    })

    if (legacyResponse) {
      return c.json({
        message: `Connected to ${server}. Synced ${result.tradeCount} closed deal(s).`,
        accountId: result.accountId,
        metaApiAccountId: result.metaApiAccountId,
        tradeCount: result.tradeCount,
      })
    }

    return c.json({
      ok: true,
      message: 'Broker account added successfully',
      accountId: result.accountId,
      tradeCount: result.tradeCount,
    })
  } catch (error: any) {
    console.error('[broker-connect-add] Add account error:', error.message)
    const msg = error.message || 'Failed to connect to broker'
    if (/invalid|auth|credential|password|login/i.test(msg)) {
      return c.json({ error: 'Invalid broker credentials. Check login, password, and server name.' }, 401)
    }
    return handleRouteError(
      legacyResponse ? 'connect-broker' : 'broker-login-sync:add',
      error,
      c,
      'Failed to connect to broker'
    )
  }
}


// ── 2. Broker Login Sync Route ──────────────────────────────────────────────
app.post('/broker-login-sync', async (c) => {
  let uid: string
  try {
    uid = await getUidFromContext(c)
  } catch (err: any) {
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

    return handleBrokerAdd(c, uid, {
      login,
      password,
      server,
      brokerType,
      accountName,
      legacyResponse: false
    })
  }

  if (action === 'sync') {
    const { accountId } = body
    if (!accountId) return c.json({ error: 'Missing accountId' }, 400)

    try {
      const accountRef = db.collection('users').doc(uid).collection('brokerAccounts').doc(accountId)
      const accountSnap = await accountRef.get()
      if (!accountSnap.exists) return c.json({ error: 'Broker account not found' }, 404)

      const account = accountSnap.data()


      const lastSyncDate = toDateOrNull(account.lastSyncTime)
      const brokerTrades = await fetchBrokerTrades(
        {
          metaApiAccountId: account.metaApiAccountId,
          login: account.login,
          server: account.server,
          brokerType: account.brokerType,
        },
        lastSyncDate as any
      )

      const syncResult = await persistBrokerTrades({
        db,
        userId: uid,
        accountId: account.id,
        brokerTrades,
        timestampFactory: now,
      })

      await accountRef.update({
        lastSyncTime: now(),
        lastSyncStatus: 'success',
        tradeCount: syncResult.totalFetched,
        updatedAt: now(),
      })

      return c.json({
        ok: true,
        message: 'Broker trades synced successfully',
        newTrades: syncResult.newTrades,
        updatedTrades: syncResult.updatedTrades,
        totalFetched: syncResult.totalFetched,
      })
    } catch (error: any) {
      console.error('[broker-login-sync] Sync error:', error.message)
      try {
        const accountRef = db.collection('users').doc(uid).collection('brokerAccounts').doc(accountId)
        await accountRef.update({
          lastSyncStatus: 'failed',
          lastSyncError: 'Sync failed. Internal error occurred.',
          updatedAt: now(),
        })
      } catch (updateErr: any) {
        console.error('[broker-login-sync] Failed to update error status:', updateErr.message)
      }
      return handleRouteError('broker-login-sync:sync', error, c, 'Sync failed')
    }
  }

  if (action === 'list') {
    try {
      const snapshot = await db.collection('users').doc(uid).collection('brokerAccounts').where('isActive', '==', true).get()
      const maskLogin = (login: any) => {
        const s = String(login)
        if (s.length <= 4) return '****'
        return '*'.repeat(s.length - 4) + s.slice(-4)
      }
      const accounts = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          accountName: data.accountName,
          brokerType: data.brokerType,
          server: data.server,
          login: maskLogin(data.login),
          isActive: data.isActive,
          lastSyncTime: data.lastSyncTime,
          lastSyncStatus: data.lastSyncStatus,
          tradeCount: data.tradeCount,
          createdAt: data.createdAt,
        }
      })
      return c.json({ accounts })
    } catch (error) {
      return handleRouteError('broker-login-sync:list', error, c)
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
  let uid: string
  try {
    uid = await getUidFromContext(c)
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

    return handleBrokerAdd(c, uid, {
      login: accountId,
      password,
      server,
      brokerType,
      accountName: `${server} · ${accountId}`,
      legacyResponse: true
    })
  } catch (err: any) {
    console.error('[connect-broker]', err.message)
    const msg = err.message || 'Failed to connect broker'
    if (/invalid|auth|credential|password|login/i.test(msg)) {
      return c.json({ error: 'Invalid broker credentials. Check login, password, and server name.' }, 401)
    }
    return handleRouteError('connect-broker', err, c)
  }
})

// ── 4. Generate API Key Route ────────────────────────────────────────────────
app.post('/generate-api-key', async (c) => {
  let uid: string
  try {
    uid = await getUidFromContext(c)
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
    return handleRouteError('generate-api-key', err, c)
  }
})

// ── 5. Revoke API Key Route ──────────────────────────────────────────────────
app.post('/revoke-api-key', async (c) => {
  let uid: string
  try {
    uid = await getUidFromContext(c)
  } catch (err: any) {
    console.error('[revoke-api-key] verifyIdToken failed:', err?.message || err)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  try {
    const snapshot = await db.collection('apiKeys').where('uid', '==', uid).get()
    if (snapshot.empty) {
      return c.json({ success: true, message: 'No active key to revoke' })
    }

    const apiKeys = snapshot.docs.map((doc: any) => doc.id)
    const batch = db.batch()
    snapshot.docs.forEach((doc: any) => batch.delete(doc.ref))
    await batch.commit()

    await db.collection('users').doc(uid).update({ mt5SyncEnabled: false })

    // Invalidate caches
    await Promise.all(apiKeys.map((key: any) => invalidateApiKeyCache(key, uid)))

    console.log(`[revoke-api-key] Key(s) revoked for uid=${uid}`)
    return c.json({ success: true })
  } catch (err: any) {
    return handleRouteError('revoke-api-key', err, c)
  }
})

// ── 5.5. Initialize User Route (Server-side Secure Trial Assignment) ─────────
app.post('/init-user', async (c) => {
  let uid: string
  try {
    uid = await getUidFromContext(c)
  } catch (err: any) {
    console.error('[init-user] verifyIdToken failed:', err?.message || err)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  try {
    const userDocRef = db.collection('users').doc(uid)
    const userDoc = await userDocRef.get()

    if (userDoc.exists) {
      const data = userDoc.data() || {}
      if (data.plan) {
        // User already initialized, return current plan details idempotently
        return c.json({
          success: true,
          plan: data.plan,
          isTrial: data.isTrial || false,
          planExpiry: data.planExpiry || null,
        })
      }
    }

    // New user signup, provision the 7-day Pro trial securely on the server
    const trialExpiry = new Date()
    trialExpiry.setDate(trialExpiry.getDate() + 7)

    const initData = {
      plan: 'pro',
      isTrial: true,
      planExpiry: trialExpiry.toISOString(),
      createdAt: now(),
      updatedAt: now(),
    }

    await userDocRef.set(initData, { merge: true })
    console.log(`[init-user] Created initial Pro trial for new user uid=${uid}`)

    return c.json({
      success: true,
      plan: 'pro',
      isTrial: true,
      planExpiry: trialExpiry.toISOString(),
    })
  } catch (err: any) {
    return handleRouteError('init-user', err, c)
  }
})

// ── 6. Lemon Squeezy Webhook Integration ─────────────────────────────────────
app.post('/lemon-squeezy-webhook', async (c) => {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[lemon-squeezy-webhook] Webhook secret missing on server')
    return c.text('Webhook secret not configured', 500)
  }

  const signature = c.req.header('x-signature')
  if (!signature) {
    return c.text('Missing x-signature header', 400)
  }

  const rawBody = await c.req.text()
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(rawBody).digest('hex')

  if (digest !== signature) {
    console.error('[lemon-squeezy-webhook] Signature verification failed')
    return c.text('Invalid signature', 401)
  }

  try {
    const body = JSON.parse(rawBody)
    const eventName = body.meta?.event_name
    const userId = body.meta?.custom_data?.user_id

    if (!userId) {
      console.warn(`[lemon-squeezy-webhook] Event ${eventName} received without user_id`)
      return c.json({ ok: true, message: 'No user_id found in custom_data' })
    }

    const attributes = body.data?.attributes
    const subscriptionId = body.data?.id
    const status = attributes?.status

    // Process subscription events
    if (
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated' ||
      eventName === 'subscription_cancelled' ||
      eventName === 'subscription_expired'
    ) {
      const userDocRef = db.collection('users').doc(userId)
      let plan = 'free'
      let planExpiry: string | null = null

      const endsAt = attributes?.ends_at
      const renewsAt = attributes?.renews_at

      if (status === 'active' || status === 'on_trial' || status === 'cancelled') {
        const expiryDate = endsAt ? new Date(endsAt) : null
        if (status === 'cancelled' && expiryDate && expiryDate.getTime() < Date.now()) {
          plan = 'free'
          planExpiry = null
        } else {
          plan = 'pro'
          planExpiry = endsAt || renewsAt || null
        }
      }

      await userDocRef.set({
        plan,
        planExpiry,
        lemonSqueezySubscriptionId: String(subscriptionId),
        lemonSqueezyStatus: status,
        updatedAt: now(),
      }, { merge: true })

      console.log(`[lemon-squeezy-webhook] User ${userId} plan set to ${plan} (status: ${status}, expiry: ${planExpiry})`)
    }

    return c.json({ ok: true })
  } catch (err: any) {
    return handleRouteError('lemon-squeezy-webhook', err, c)
  }
})

// ── 8. Save Trade Route ──────────────────────────────────────────────────────
app.post('/save-trade', async (c) => {
  let uid: string
  try {
    uid = await getUidFromContext(c)
  } catch (err: any) {
    console.error('[save-trade] verifyIdToken failed:', err.message)
    return c.json({ error: 'Invalid or expired token', details: 'Authentication verification failed' }, 401)
  }

  try {
    let tradeData;
    try {
      tradeData = await c.req.json()
    } catch {
      return c.json({ error: 'Missing trade data payload' }, 400)
    }

    if (!tradeData || typeof tradeData !== 'object') {
      return c.json({ error: 'Missing trade data payload' }, 400)
    }

    const TRADE_FIELDS = ['symbol','direction','lots','openPrice',
      'closePrice','openTime','closeTime','pnl','commission',
      'swap','note','session','setup','riskRewardRatio',
      'emotionTag','screenshot','tags']

    const safe: any = Object.fromEntries(
      TRADE_FIELDS
        .filter(k => k in tradeData)
        .map(k => [k, tradeData[k]])
    )

    const NUMERICS = ['lots','openPrice','closePrice','pnl',
      'commission','swap','riskRewardRatio']
    NUMERICS.forEach(k => { if (k in safe) safe[k] = Number(safe[k]) || 0 })

    if (safe.note && safe.note.length > 4000) {
      return c.json({ error: 'note exceeds 4000 characters' }, 400)
    }
    if (safe.symbol && safe.symbol.length > 20) {
      return c.json({ error: 'invalid symbol' }, 400)
    }

    const userDoc = await db.collection('users').doc(uid).get()
    const userData = userDoc.exists ? userDoc.data() : {}
    const plan = userData.plan || 'free'

    if (plan !== 'pro') {
      const totalTrades = userData.totalTradesLogged || 0
      if (totalTrades >= 50) {
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
        ...safe,
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
    return handleRouteError('save-trade', err, c)
  }
})

// ── 9. Sync Trade Route ──────────────────────────────────────────────────────
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
    if (event === 'open') {
      result = await handleOpenTradeSync(tradeRef, body, 'mt5')
    } else if (event === 'close') {
      result = await handleCloseTradeSync(tradeRef, body, 'mt5')
    } else {
      return c.json({ error: `Unknown event: ${event}` }, 400)
    }
  } catch (err: any) {
    return handleRouteError('sync-trade', err, c)
  }

  console.log(`[sync-trade] uid=${uid} event=${event} pos=${positionId}`, result)
  return c.json(result)
})

// ── 10b. Reset Trades Route ──────────────────────────────────────────────────
app.post('/reset-trades', async (c) => {
  let uid: string
  try {
    uid = await getUidFromContext(c)
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
      const docs = snapshot.docs
      const CHUNK_SIZE = 400
      for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE)
        const batch = db.batch()
        chunk.forEach((doc: any) => batch.delete(doc.ref))
        await batch.commit()
      }
    }

    await db.collection('users').doc(uid).set({
      totalTradesLogged: 0
    }, { merge: true })

    console.log(`[reset-trades] Wiped trades for uid=${uid}`)
    return c.json({ success: true, message: 'All trades reset successfully.' })
  } catch (err: any) {
    return handleRouteError('reset-trades', err, c)
  }
})

// ── 11. TradingView Webhook Route ────────────────────────────────────────────
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
    if (event === 'open') {
      result = await handleOpenTradeSync(tradeRef, body, 'tradingview')
    } else if (event === 'close') {
      result = await handleCloseTradeSync(tradeRef, body, 'tradingview')
    } else {
      return c.json({ error: `Unknown event: ${event}` }, 400)
    }
  } catch (err: any) {
    return handleRouteError('tv-webhook', err, c)
  }

  console.log(`[tv-webhook] uid=${uid} event=${event} pos=${positionId}`, result)
  return c.json(result)
})

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
    // 1. Fetch all active broker accounts across the database in one collection group query
    const accountsSnapshot = await db
      .collectionGroup('brokerAccounts')
      .where('isActive', '==', true)
      .get()

    if (accountsSnapshot.empty) {
      console.log('[broker-sync-poller] No active broker accounts found.')
      return c.json({
        ok: true,
        timestamp: new Date().toISOString(),
        usersProcessed: 0,
        accountsProcessed: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
      })
    }

    // 2. Extract unique owner user IDs (UIDs) from account document paths
    const activeAccounts = accountsSnapshot.docs
    const uids = Array.from(new Set(activeAccounts.map((doc: any) => doc.ref.parent.parent.id)))

    // 3. Fetch all parent user documents in parallel chunked reads
    const userRefs = uids.map(uid => db.collection('users').doc(uid))
    const userSnaps = await chunkedDbGetAll(db, userRefs)
    const usersMap = new Map()
    userSnaps.forEach((snap: any) => {
      if (snap.exists) {
        usersMap.set(snap.id, snap.data())
      }
    })

    // 4. Filter accounts that belong to users with valid sync access
    const accountsToSync = []
    const usersCounted = new Set()

    for (const accountDoc of activeAccounts) {
      const accountData = accountDoc.data()
      const uid = accountDoc.ref.parent.parent.id
      const userData = usersMap.get(uid)

      if (!userData || !isSyncAllowed(userData)) {
        continue
      }

      usersCounted.add(uid)
      totalAccounts++

      accountsToSync.push({
        uid,
        accountData,
        accountId: accountDoc.id,
        accountRef: accountDoc.ref,
      })
    }

    totalUsers = usersCounted.size

    // 5. Sync accounts in parallel with a bounded concurrency pool (limit of 5 concurrent processes)
    const syncAccountTask = async ({ uid, accountData, accountId, accountRef }: any) => {
      try {
        const lastSyncDate = toDateOrNull(accountData.lastSyncTime)
        if (lastSyncDate) {
          const lastSync = lastSyncDate.getTime()
          const timeSinceSync = Date.now() - lastSync
          if (timeSinceSync < 30000) {
            console.log(`[broker-sync-poller] Skipping ${accountId} - recently synced`)
            return
          }
        }


        const brokerTrades = await fetchBrokerTrades(
          {
            metaApiAccountId: accountData.metaApiAccountId,
            login: accountData.login,
            server: accountData.server,
            brokerType: accountData.brokerType,
          },
          lastSyncDate as any
        )

        const syncResult = await persistBrokerTrades({
          db,
          userId: uid,
          accountId,
          brokerTrades,
          timestampFactory: () => new Date().toISOString(),
        })

        await accountRef.update({
          lastSyncTime: new Date().toISOString(),
          lastSyncStatus: 'success',
          tradeCount: syncResult.totalFetched,
          updatedAt: new Date().toISOString(),
        })

        await db.collection('users').doc(uid).set({
          lastBrokerSync: new Date(),
          lastBrokerSyncStatus: 'success',
          lastBrokerSyncCount: syncResult.totalFetched,
          lastBrokerSyncError: null
        }, { merge: true })

        console.log(`[broker-sync-poller] Synced ${syncResult.newTrades} new trades for ${accountId}`)
        successfulSyncs++
      } catch (error: any) {
        console.error(`[broker-sync-poller] ✗ Failed to sync ${accountId}:`, error.message)
        
        try {
          await accountRef.update({
            lastSyncStatus: 'failed',
            lastSyncError: error.message,
            updatedAt: new Date().toISOString(),
          })

          await db.collection('users').doc(uid).set({
            lastBrokerSyncStatus: 'failed',
            lastBrokerSyncError: error.message
          }, { merge: true })
        } catch (updateErr: any) {
          console.error('[broker-sync-poller] Failed to update error status:', updateErr.message)
        }

        failedSyncs++
      }
    }

    // Run sync tasks with a concurrency limit of 5 to avoid CPU/memory exhaustion or MetaAPI limit hitting
    await runWithConcurrencyLimit(5, accountsToSync, syncAccountTask)

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      usersProcessed: totalUsers,
      accountsProcessed: totalAccounts,
      successfulSyncs,
      failedSyncs,
    }

    console.log('[broker-sync-poller] Completed scheduled broker sync:', result)
    return c.json(result)
  } catch (error: any) {
    return handleRouteError('broker-sync-poller', error, c, 'Cron job failed')
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

    for (const doc of snapshot.docs) {
      const data = doc.data()
      if (!data.planExpiry) continue

      const expiryDate = new Date(data.planExpiry)

      if (expiryDate <= threeDaysFromNow && expiryDate > new Date(threeDaysFromNow.getTime() - 86400000)) {
        try {
          const authUser = await admin.auth().getUser(doc.id)
          const verifiedEmail = authUser.email

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!verifiedEmail || !emailRegex.test(verifiedEmail)) {
            console.warn(`[remind-expiry] Skipping ${doc.id}: no verified email`)
            continue
          }

          emailPromises.push(
            resend.emails.send({
              from: 'xaujournal <alerts@xaujournal.com>',
              to: verifiedEmail,
              subject: 'xaujournal: 3 Days Left of Pro',
              html: `<p>Hi ${data.name || 'Trader'}, your Pro access expires in 3 days. Renew now to avoid losing your advanced analytics.</p>`
            })
          )
        } catch (authErr: any) {
          console.error(`[remind-expiry] Failed to fetch auth user or send email for ${doc.id}:`, authErr.message)
        }
      }
    }

    await Promise.all(emailPromises)
    return c.json({ success: true, sent: emailPromises.length })
  } catch (error: any) {
    return handleRouteError('remind-expiry', error, c)
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

    const revokeTasks = snapshot.docs.map(async (userDoc: any) => {
      const uid = userDoc.id
      try {
        const keySnap = await db.collection('apiKeys').where('uid', '==', uid).get()
        const apiKeys = keySnap.docs.map((doc: any) => doc.id)
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
        
        // Invalidate KV caches
        await Promise.all(apiKeys.map((key: any) => invalidateApiKeyCache(key, uid)))
        await invalidateUserCache(uid)

        console.log(`[revoke-expired] Revoked keys and downgraded uid=${uid}`)
        return true
      } catch (e: any) {
        console.error(`[revoke-expired] Failed for uid=${uid}:`, e.message)
        return false
      }
    })

    const results = await Promise.all(revokeTasks)
    const revokedCount = results.filter(Boolean).length

    return c.json({ success: true, revoked: revokedCount })
  } catch (error: any) {
    return handleRouteError('revoke-expired', error, c)
  }
}
app.get('/cron/revoke-expired', handleRevokeExpired)
app.post('/cron/revoke-expired', handleRevokeExpired)

// Proxy route for Yahoo Finance to bypass client-side CORS issues
app.get('/yahoo-chart/:symbol', async (c) => {
  const symbol = c.req.param('symbol')
  const interval = c.req.query('interval') || '1m'
  const range = c.req.query('range') || '1d'

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`
    const res = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!res.ok) {
      return c.json({ error: 'Failed to fetch from Yahoo Finance', status: res.status }, res.status as any)
    }

    const data = await res.json()
    return c.json(data)
  } catch (error: any) {
    console.error('[yahoo-chart] Proxy error:', error)
    return c.json({ error: 'Internal Server Error', message: error.message }, 500)
  }
})

// Proxy route for spot precious metals prices from Gold-API
app.get('/spot-price/:symbol', async (c) => {
  const symbol = c.req.param('symbol')
  try {
    const res = await fetch(`https://api.gold-api.com/price/${encodeURIComponent(symbol)}`)
    if (!res.ok) {
      return c.json({ error: 'Failed to fetch spot price from Gold-API', status: res.status }, res.status as any)
    }
    const data = await res.json()
    return c.json(data)
  } catch (error: any) {
    console.error('[spot-price] Proxy error:', error)
    return c.json({ error: 'Internal Server Error', message: error.message }, 500)
  }
})



// Export handlers for Vercel
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
