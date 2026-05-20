// api/_resend.js
import { Resend } from 'resend';

/* eslint-env node */
/* global process */
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
