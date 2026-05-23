import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import crypto from 'crypto'

// Import shared helpers (using JS files under /api)
// @ts-ignore
import { admin, db, initAdmin, now } from './_firebase.js'
// @ts-ignore
import resend from './_resend.js'
// @ts-ignore
import client, { checkoutNodeJssdk } from './_paypal.js'
// @ts-ignore
import { fetchBrokerTrades, provisionMetaApiAccount, fetchMetaApiDeals } from './_metaapi-broker.js'

type Env = {}
type Variables = {}

export const app = new Hono<{ Bindings: Env; Variables }>().basePath('/api')

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
    return c.text('', 204)
  }
  await next()
})

// ── Shared plan guard ────────────────────────────────────────────────────────
function isSyncAllowed(userData: any) {
  const { plan, planExpiry, graceUntil } = userData || {}
  const nowMs = Date.now()
  if (plan === 'pro' && planExpiry && new Date(planExpiry).getTime() > nowMs) return true
  if (graceUntil && new Date(graceUntil).getTime() > nowMs) return true
  return false
}

function encryptCredential(text: string) {
  return Buffer.from(text).toString('base64')
}

function decryptCredential(encoded: string) {
  return Buffer.from(encoded, 'base64').toString('utf-8')
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
            event: { token, siteKey: '6LfSRMosAAAAAJkpsSHRweUx48z1amorEE2Abqe7', expectedAction: recaptchaAction }
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
      const metaApiAccountId = await provisionMetaApiAccount({ login, password, server, brokerType })
      const testResult = await fetchBrokerTrades({ metaApiAccountId }, null)
      const brokerRef = db.collection('users').doc(uid).collection('brokerAccounts').doc()

      await brokerRef.set({
        id: brokerRef.id,
        accountName: accountName || `${brokerType.toUpperCase()}-${server}`,
        brokerType,
        server,
        login,
        encryptedPassword: encryptCredential(password),
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
      if (error.message.includes('Invalid') || error.message.includes('Authentication')) {
        return c.json({ error: 'Invalid broker credentials. Please check your login, password, and server.' }, 401)
      }
      return c.json({ error: 'Failed to connect to broker', message: error.message }, 500)
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
      const decryptedPassword = decryptCredential(account.encryptedPassword)

      const brokerTrades = await fetchBrokerTrades(
        {
          metaApiAccountId: account.metaApiAccountId,
          login: account.login,
          password: decryptedPassword,
          server: account.server,
          brokerType: account.brokerType,
        },
        account.lastSyncTime?.toDate ? account.lastSyncTime.toDate() : account.lastSyncTime ? new Date(account.lastSyncTime) : null
      )

      let newTradesCount = 0
      let updatedTradesCount = 0
      const tradesRef = db.collection('users').doc(uid).collection('trades')
      const batch = db.batch()

      for (const trade of brokerTrades) {
        const tradeDocId = `broker_${account.id}_${trade.closeDealTicket}`
        const tradeRef = tradesRef.doc(tradeDocId)
        const existing = await tradeRef.get()
        const tradeData = {
          ...trade,
          accountId: account.id,
          syncedAt: now(),
          updatedAt: now(),
        }

        if (!existing.exists) {
          tradeData.createdAt = now()
          newTradesCount++
        } else {
          updatedTradesCount++
        }
        batch.set(tradeRef, tradeData, { merge: true })
      }

      await batch.commit()
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
      await db.collection('users').doc(uid).collection('brokerAccounts').doc(accountId).update({
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
  } catch {
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

    const metaApiAccountId = await provisionMetaApiAccount({ login: accountId, password, server, brokerType })
    const deals = await fetchMetaApiDeals(metaApiAccountId)

    const brokerRef = db.collection('users').doc(uid).collection('brokerAccounts').doc()
    await brokerRef.set({
      id: brokerRef.id,
      accountName: `${server} · ${accountId}`,
      brokerType,
      server,
      login: String(accountId),
      encryptedPassword: encryptCredential(password),
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

// ── 6. Checkout Route ────────────────────────────────────────────────────────
app.get('/checkout', (c) => {
  return c.json({ status: 'PayPal checkout endpoint is active' })
})

app.post('/checkout', async (c) => {
  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { origin, email, userId, planType = 'pro_monthly' } = body
  if (!email || !userId || !origin) {
    return c.json({ error: 'Missing required checkout fields.' }, 400)
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

    const amount = planType === 'pro_yearly' ? '104.00' : '14.99'
    const orderRequest = new checkoutNodeJssdk.orders.OrdersCreateRequest()
    orderRequest.prefer('return=representation')
    orderRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `xaujournal_${userId}`,
          description: planType === 'pro_yearly' ? 'xaujournal Pro Yearly' : 'xaujournal Pro Monthly',
          custom_id: `${userId}:${planType}`,
          amount: {
            currency_code: 'USD',
            value: amount,
          },
        },
      ],
      application_context: {
        brand_name: 'xaujournal',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: `${origin}/app/checkout-success?planType=${planType}`,
        cancel_url: `${origin}/app/checkout-cancel`,
      },
    })

    const order = await client.execute(orderRequest)
    const approvalLink = order.result.links.find((link: any) => link.rel === 'approve')
    if (!approvalLink) {
      throw new Error('PayPal did not return an approval link.')
    }

    return c.json({ url: approvalLink.href })
  } catch (error: any) {
    console.error('[checkout] PayPal error:', error.message || error)
    return c.json({ error: `PayPal checkout failed: ${error.message || 'unknown error'}` }, 500)
  }
})

// ── 7. PayPal Capture Route ──────────────────────────────────────────────────
app.post('/paypal-capture', async (c) => {
  let body;
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { orderId, planType = 'pro_monthly', userId } = body
  if (!orderId || !userId) {
    return c.json({ error: 'Missing required capture parameters.' }, 400)
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

    const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId)
    captureRequest.requestBody({})
    const capture = await client.execute(captureRequest)
    if (capture.result.status !== 'COMPLETED') {
      return c.json({ error: 'Payment was not completed.' }, 400)
    }

    const planExpiry = new Date()
    planExpiry.setDate(planExpiry.getDate() + (planType === 'pro_yearly' ? 365 : 30))

    await db.collection('users').doc(userId).set({
      plan: 'pro',
      planExpiry: planExpiry.toISOString(),
      paypalOrderId: orderId,
      paypalCaptureId: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    return c.json({ success: true, planExpiry: planExpiry.toISOString() })
  } catch (error: any) {
    console.error('[paypal-capture] error:', error.message || error)
    return c.json({ error: `PayPal capture failed: ${error.message || 'unknown error'}` }, 500)
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
      if (tradesSnap.data().count >= 25) {
        return c.json({
          error: 'Free tier limit reached (25 trades). Upgrade to Pro.',
          code: 'resource-exhausted'
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
app.post('/trades', async (c) => {
  const apiKey = c.req.header('x-api-key')
  if (!apiKey || !apiKey.startsWith('xau_live_')) {
    return c.json({ error: 'Missing or invalid API key' }, 401)
  }

  const snapshot = await db.collection('users').where('apiKey', '==', apiKey).limit(1).get()
  if (snapshot.empty) {
    return c.json({ error: 'API key not found' }, 401)
  }

  const uid = snapshot.docs[0].id
  const user = snapshot.docs[0].data()

  if (user.plan !== 'pro') {
    return c.json({ error: 'EA sync requires Pro plan' }, 403)
  }

  let trade;
  try {
    trade = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const required = ['ticket', 'symbol', 'type', 'lots', 'openPrice', 'closePrice', 'pnl']
  for (const field of required) {
    if (trade[field] === undefined || trade[field] === null) {
      return c.json({ error: `Missing field: ${field}` }, 400)
    }
  }

  const tradeRef = db.doc(`users/${uid}/trades/${trade.ticket}`)
  const existing = await tradeRef.get()
  if (existing.exists) {
    return c.json({ ok: true, skipped: 'duplicate' })
  }

  await Promise.all([
    tradeRef.set({
      ticket: String(trade.ticket),
      symbol: trade.symbol,
      type: trade.type,
      lots: Number(trade.lots),
      openPrice: Number(trade.openPrice),
      closePrice: Number(trade.closePrice),
      stopLoss: Number(trade.stopLoss || 0),
      takeProfit: Number(trade.takeProfit || 0),
      pnl: Number(trade.pnl),
      commission: Number(trade.commission || 0),
      swap: Number(trade.swap || 0),
      openTime: trade.openTime,
      closeTime: trade.closeTime,
      source: 'mt5_ea',
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    }),
    db.doc(`users/${uid}`).update({
      totalTradesLogged: admin.firestore.FieldValue.increment(1),
    })
  ])

  return c.json({ ok: true, ticket: trade.ticket })
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

// ── 12. PayPal Webhook Route ─────────────────────────────────────────────────
function getRequiredHeader(c: any, name: string) {
  const v = c.req.header(name)
  return v || null
}

function parsePlanTypeFromCustomId(customId: string | null) {
  if (!customId || typeof customId !== 'string') return null
  const parts = customId.split(':')
  if (parts.length < 2) return null
  return parts[1]
}

function parseUserIdFromCustomId(customId: string | null) {
  if (!customId || typeof customId !== 'string') return null
  const parts = customId.split(':')
  if (parts.length < 2) return null
  return parts[0]
}

function computeExpiry(planType: string) {
  const planExpiry = new Date()
  planExpiry.setDate(
    planExpiry.getDate() + (planType === 'pro_yearly' ? 365 : 30)
  )
  return planExpiry
}

async function markEventProcessed(eventId: string) {
  await db.collection('paypalWebhookEvents').doc(eventId).set(
    { processedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
}

async function isEventProcessed(eventId: string) {
  const doc = await db.collection('paypalWebhookEvents').doc(eventId).get()
  return doc.exists
}

app.post('/paypal/webhook', async (c) => {
  try {
    initAdmin()
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialised.')
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      return c.json({ error: 'Missing env var: PAYPAL_WEBHOOK_ID' }, 500)
    }

    const authAlgo = getRequiredHeader(c, 'PAYPAL-AUTH-ALGO')
    const transmissionId = getRequiredHeader(c, 'PAYPAL-TRANSMISSION-ID')
    const transmissionSig = getRequiredHeader(c, 'PAYPAL-TRANSMISSION-SIG')
    const certUrl = getRequiredHeader(c, 'PAYPAL-CERT-URL')

    if (!authAlgo || !transmissionId || !transmissionSig || !certUrl) {
      return c.json({
        error: 'Missing PayPal webhook verification headers',
        received: {
          'PAYPAL-AUTH-ALGO': !!authAlgo,
          'PAYPAL-TRANSMISSION-ID': !!transmissionId,
          'PAYPAL-TRANSMISSION-SIG': !!transmissionSig,
          'PAYPAL-CERT-URL': !!certUrl,
        }
      }, 400)
    }

    const bodyText = await c.req.text()
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText)
    } catch {
      return c.json({ error: 'Invalid JSON payload' }, 400)
    }

    const verification = await new checkoutNodeJssdk.Webhooks().verifyWebhookSignature(
      webhookId,
      bodyJson,
      {
        auth_algo: authAlgo,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        cert_url: certUrl,
      }
    )

    if (!verification || verification.status !== 'SUCCESS') {
      return c.json({
        error: 'PayPal webhook verification failed',
        details: verification
      }, 400)
    }

    const event = verification.event || verification
    const eventId = event?.id || event?.resource?.id
    if (!eventId) {
      return c.json({ error: 'Missing PayPal event id in verified payload.' }, 400)
    }

    if (await isEventProcessed(eventId)) {
      return c.json({ success: true, alreadyProcessed: true, eventId })
    }

    const eventType = event?.event_type
    const resource = event?.resource || {}
    const resourceId = resource?.id || null

    const customId =
      resource?.custom_id ||
      resource?.purchase_units?.[0]?.custom_id ||
      resource?.billing_agreement_id ||
      resource?.invoice_id

    const userId = parseUserIdFromCustomId(customId)
    const planType = parsePlanTypeFromCustomId(customId)

    if (!userId || !planType) {
      return c.json({
        error: 'Could not extract userId/planType from PayPal webhook payload',
        eventType,
        resourceId,
        customId
      }, 400)
    }

    const captureId =
      resource?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      resource?.custom_id

    const planExpiry = computeExpiry(planType)

    await db.collection('users').doc(userId).set(
      {
        plan: 'pro',
        planExpiry: planExpiry.toISOString(),
        paypalOrderId: resource?.supplementary_data?.related_ids?.order_id || null,
        paypalCaptureId: captureId || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastPayPalWebhookEvent: eventId,
        lastPayPalWebhookType: eventType || null,
      },
      { merge: true }
    )

    await markEventProcessed(eventId)

    return c.json({ success: true, updated: true, eventId })
  } catch (error: any) {
    console.error('[paypal-webhook] error:', error?.message || error)
    return c.json({ error: 'Internal Server Error', message: error?.message || String(error) }, 500)
  }
})

// ── 13. Cron Jobs ───────────────────────────────────────────────────────────
const handleBrokerSyncPoller = async (c: any) => {
  const cronSecret = c.req.header('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
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

          const password = decryptCredential(account.encryptedPassword)

          const brokerTrades = await fetchBrokerTrades(
            {
              login: account.login,
              password,
              server: account.server,
              brokerType: account.brokerType,
            },
            account.lastSyncTime ? new Date(account.lastSyncTime) : null
          )

          const tradesRef = db.collection('users').doc(uid).collection('trades')
          const batch = db.batch()

          let newCount = 0
          for (const trade of brokerTrades) {
            const tradeDocId = `broker_${accountId}_${trade.closeDealTicket}`
            const tradeRef = tradesRef.doc(tradeDocId)
            const existing = await tradeRef.get()

            if (!existing.exists) {
              newCount++
            }

            batch.set(tradeRef, {
              ...trade,
              accountId,
              syncedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...(existing.exists ? {} : { createdAt: new Date().toISOString() }),
            }, { merge: true })
          }

          await batch.commit()

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
