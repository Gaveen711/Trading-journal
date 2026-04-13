// api/cron/remind-expiry.js
import { db } from '../../lib/firebase-admin-config'; // Use admin to read all users
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Security: Check for Vercel Cron Secret to prevent unauthorized triggers
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

  try {
    // 1. Fetch users whose plan is 'pro'
    const usersSnapshot = await db.collection('users').where('plan', '==', 'pro').get();

    const emailPromises = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const expiry = data.planExpiry?.toDate(); // Firebase Timestamps

      // 2. Check if expiry is in exactly 3 days (or within a 24h window)
      if (expiry && expiry <= threeDaysFromNow && expiry > now) {
        emailPromises.push(
          resend.emails.send({
            from: 'Gold Journal <billing@yourdomain.com>',
            to: data.email,
            subject: 'Your Pro Access is Expiring Soon',
            html: `<strong>Hi ${data.name || 'Trader'},</strong><p>Your Pro plan expires in 3 days. Renew now to keep your advanced XAU analytics!</p>`
          })
        );
      }
    });

    await Promise.all(emailPromises);
    return res.status(200).json({ success: true, sent: emailPromises.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}