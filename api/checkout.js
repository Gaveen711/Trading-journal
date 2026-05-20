import { checkoutNodeJssdk } from './_paypal.js';
import paypalClient from './_paypal.js';
import { admin, initAdmin } from './_firebase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'PayPal checkout endpoint is active' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin, email, userId, planType = 'pro_monthly' } = req.body;
  if (!email || !userId || !origin) {
    return res.status(400).json({ error: 'Missing required checkout fields.' });
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

    const amount = planType === 'pro_yearly' ? '139.00' : '19.99';
    const orderRequest = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    orderRequest.prefer('return=representation');
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
    });

    const order = await paypalClient.execute(orderRequest);
    const approvalLink = order.result.links.find((link) => link.rel === 'approve');
    if (!approvalLink) {
      throw new Error('PayPal did not return an approval link.');
    }

    return res.status(200).json({ url: approvalLink.href });
  } catch (error) {
    console.error('[checkout] PayPal error:', error.message || error);
    return res.status(500).json({ error: `PayPal checkout failed: ${error.message || 'unknown error'}` });
  }
}
