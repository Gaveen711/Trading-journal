/* eslint-env node */
/* global process */
import { checkoutNodeJssdk } from '../../../../api/_paypal.js';
import { admin, db, initAdmin } from '../../../../api/_firebase.js';

const { Webhooks } = checkoutNodeJssdk;

function getRequiredHeader(req, name) {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

function parsePlanTypeFromCustomId(customId) {
  // Checkout sets: custom_id: `${userId}:${planType}`
  // planType is expected to be: pro_monthly | pro_yearly
  if (!customId || typeof customId !== 'string') return null;
  const parts = customId.split(':');
  if (parts.length < 2) return null;
  return parts[1];
}

function parseUserIdFromCustomId(customId) {
  if (!customId || typeof customId !== 'string') return null;
  const parts = customId.split(':');
  if (parts.length < 2) return null;
  return parts[0];
}

function computeExpiry(planType) {
  const planExpiry = new Date();
  planExpiry.setDate(
    planExpiry.getDate() + (planType === 'pro_yearly' ? 365 : 30)
  );
  return planExpiry;
}

async function markEventProcessed(eventId) {
  // Dedicated idempotency store
  // Collection: paypalWebhookEvents/{eventId}
  await db.collection('paypalWebhookEvents').doc(eventId).set(
    { processedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function isEventProcessed(eventId) {
  const doc = await db.collection('paypalWebhookEvents').doc(eventId).get();
  return doc.exists;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    initAdmin();
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialised.');
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      return res.status(500).json({ error: 'Missing env var: PAYPAL_WEBHOOK_ID' });
    }

    const authAlgo = getRequiredHeader(req, 'PAYPAL-AUTH-ALGO');
    const transmissionId = getRequiredHeader(req, 'PAYPAL-TRANSMISSION-ID');
    const transmissionSig = getRequiredHeader(req, 'PAYPAL-TRANSMISSION-SIG');
    const certUrl = getRequiredHeader(req, 'PAYPAL-CERT-URL');

    // Basic presence checks
    if (!authAlgo || !transmissionId || !transmissionSig || !certUrl) {
      return res.status(400).json({
        error: 'Missing PayPal webhook verification headers',
        received: {
          'PAYPAL-AUTH-ALGO': !!authAlgo,
          'PAYPAL-TRANSMISSION-ID': !!transmissionId,
          'PAYPAL-TRANSMISSION-SIG': !!transmissionSig,
          'PAYPAL-CERT-URL': !!certUrl,
        }
      });
    }

    // Verify webhook signature authenticity
    // checkout-server-sdk verifies webhook signatures using the headers + raw body
    const verification = await new Webhooks().verifyWebhookSignature(
      webhookId,
      req.body,
      {
        auth_algo: authAlgo,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        cert_url: certUrl,
        // Mode is not strictly required for verification; keep for completeness if SDK needs it.
        // mode: PAYPAL_MODE,
      }
    );

    if (!verification || verification.status !== 'SUCCESS') {
      return res.status(400).json({
        error: 'PayPal webhook verification failed',
        details: verification
      });
    }

    const event = verification.event || verification;
    const eventId = event?.id || event?.resource?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'Missing PayPal event id in verified payload.' });
    }

    if (await isEventProcessed(eventId)) {
      return res.status(200).json({ success: true, alreadyProcessed: true, eventId });
    }

    const eventType = event?.event_type;
    const resource = event?.resource || {};
    const resourceId = resource?.id || null;

    // Try common locations:
    // - resource.custom_id may exist for payment events
    // - sometimes resource.purchase_units[0].custom_id
    const customId =
      resource?.custom_id ||
      resource?.purchase_units?.[0]?.custom_id ||
      resource?.billing_agreement_id ||
      resource?.invoice_id;

    const userId = parseUserIdFromCustomId(customId);
    const planType = parsePlanTypeFromCustomId(customId);

    if (!userId || !planType) {
      return res.status(400).json({
        error: 'Could not extract userId/planType from PayPal webhook payload',
        eventType,
        resourceId,
        customId
      });
    }

    const captureId =
      resource?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      resource?.custom_id; // fallback (won't be used in schema ideally)

    const planExpiry = computeExpiry(planType);

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
    );

    await markEventProcessed(eventId);

    return res.status(200).json({ success: true, updated: true, eventId });
  } catch (error) {
    console.error('[paypal-webhook] error:', error?.message || error);
    return res.status(500).json({ error: 'Internal Server Error', message: error?.message || String(error) });
  }
}

// Prevent body parsing issues if PayPal sends non-standard content-type.
// Depending on your Next.js version, this may be required.
// export const config = { api: { bodyParser: false } };
