import Stripe from 'stripe';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  // 1. Health Check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Portal API is active' });
  }

  // 2. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, origin } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId in request body." });
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET;
  const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!STRIPE_SECRET) {
    return res.status(500).json({ error: "Configuration Error: STRIPE_SECRET is missing." });
  }
  if (!SERVICE_ACCOUNT) {
    return res.status(500).json({ error: "Configuration Error: FIREBASE_SERVICE_ACCOUNT is missing." });
  }

  const stripe = new Stripe(STRIPE_SECRET);

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(SERVICE_ACCOUNT))
      });
    } catch (e) {
      console.error("FIREBASE ADMIN INIT ERROR:", e);
      return res.status(500).json({ error: `Firebase Admin initialization failed: ${e.message}` });
    }
  }

  const db = admin.firestore();

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: `User profile for ID ${userId} not found in Firestore.` });
    }

    const { stripeCustomerId } = userDoc.data();

    if (!stripeCustomerId) {
      return res.status(400).json({ 
        error: "Billing Error: No Stripe Customer ID found. This user probably hasn't completed a successful checkout yet." 
      });
    }

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: origin || 'https://myjournal-walker3.vercel.app',
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("PORTAL CRITICAL ERROR:", error);
    return res.status(500).json({ error: `Critical Portal Failure: ${error.message}` });
  }
}
