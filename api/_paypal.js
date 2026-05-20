import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

/* eslint-env node */
/* global process */
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE?.toLowerCase() === 'live' ? 'live' : 'sandbox';

if (!clientId || !clientSecret) {
  throw new Error('Missing PayPal client credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
}

const environment = mode === 'live'
  ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
  : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

export { checkoutNodeJssdk };
export default client;
