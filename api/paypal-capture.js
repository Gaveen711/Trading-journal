import { checkoutNodeJssdk } from './_paypal.js';
import paypalClient from './_paypal.js';
import { admin, db, initAdmin } from './_firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, planType = 'pro_monthly', userId } = req.body;
  if (!orderId || !userId) {
    return res.status(400).json({ error: 'Missing required capture parameters.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    initAdmin();
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialised.');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return res.status(403).json({ error: 'Forbidden: User ID mismatch.' });
    }

    const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});
    const capture = await paypalClient.execute(captureRequest);
    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment was not completed.' });
    }

    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + (planType === 'pro_yearly' ? 365 : 30));

    await db.collection('users').doc(userId).set({
      plan: 'pro',
      planExpiry: planExpiry.toISOString(),
      paypalOrderId: orderId,
      paypalCaptureId: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ success: true, planExpiry: planExpiry.toISOString() });
  } catch (error) {
    console.error('[paypal-capture] error:', error.message || error);
    return res.status(500).json({ error: `PayPal capture failed: ${error.message || 'unknown error'}` });
  }
}
