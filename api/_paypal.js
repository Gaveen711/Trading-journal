const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE?.toLowerCase() === 'live' ? 'live' : 'sandbox';

if (!clientId || !clientSecret) {
  throw new Error('Missing PayPal client credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
}

const paypalApiUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get PayPal token: ${errorText}`);
  }
  const data = await response.json();
  return data.access_token;
};

const createOrder = async (orderPayload) => {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(orderPayload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create order: ${errorText}`);
  }
  return response.json();
};

const captureOrder = async (orderId) => {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to capture order: ${errorText}`);
  }
  return response.json();
};

const verifyWebhookSignature = async (webhookId, webhookEvent, headers) => {
  const token = await getPayPalAccessToken();
  const payload = {
    auth_algo: headers.auth_algo,
    cert_url: headers.cert_url,
    transmission_id: headers.transmission_id,
    transmission_sig: headers.transmission_sig,
    transmission_time: headers.transmission_time,
    webhook_id: webhookId,
    webhook_event: webhookEvent
  };
  
  const response = await fetch(`${paypalApiUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to verify webhook: ${errorText}`);
  }
  return response.json();
};

export { getPayPalAccessToken, createOrder, captureOrder, verifyWebhookSignature, paypalApiUrl };
