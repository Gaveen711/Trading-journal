import type {
  Analytics,
  Announcement,
  Coupon,
  Overview,
  Payment,
  Report,
  Subscription,
  SystemSettings,
  User,
} from '../../domain/models';
import {
  boolean,
  dateString,
  enumValue,
  first,
  number,
  optionalArray,
  optionalBoolean,
  optionalDateString,
  optionalNumber,
  optionalString,
  record,
  string,
} from './runtime';

const USER_PLANS = ['FREE', 'PRO', 'GRACE'] as const;
const USER_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
const SUBSCRIPTION_STATUSES = ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'PAUSED', 'UNKNOWN'] as const;
const PAYMENT_STATUSES = ['SUCCESS', 'FAILED', 'REFUNDED', 'PENDING'] as const;
const REPORT_TYPES = ['BUG', 'FEATURE_REQUEST', 'SUPPORT'] as const;
const REPORT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'] as const;
const COUPON_TYPES = ['PERCENT', 'FIXED'] as const;
const ANNOUNCEMENT_TARGETS = ['ALL', 'PRO_ONLY', 'FREE_ONLY'] as const;
const ANNOUNCEMENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const ANNOUNCEMENT_LEVELS = ['INFO', 'WARNING', 'CRITICAL'] as const;

function normalizedPaymentStatus(value: unknown, path: string): Payment['status'] {
  if (typeof value !== 'string') return enumValue(value, PAYMENT_STATUSES, path);
  const normalized = value.toLowerCase();
  if (['paid', 'completed', 'succeeded', 'success'].includes(normalized)) return 'SUCCESS';
  if (normalized === 'failed') return 'FAILED';
  if (normalized === 'refunded') return 'REFUNDED';
  if (['pending', 'processing'].includes(normalized)) return 'PENDING';
  return enumValue(value, PAYMENT_STATUSES, path);
}

function normalizedReportStatus(value: unknown, path: string): Report['status'] {
  if (value === 'in_review') return 'IN_PROGRESS';
  return enumValue(value, REPORT_STATUSES, path, 'OPEN');
}

function normalizedSubscriptionStatus(value: unknown, path: string): Subscription['status'] {
  if (value === undefined || value === null || value === '') return 'ACTIVE';
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['cancelled', 'canceled'].includes(normalized)) return 'CANCELED';
    if (['past_due', 'past-due'].includes(normalized)) return 'PAST_DUE';
  }
  return enumValue(value, SUBSCRIPTION_STATUSES, path, 'UNKNOWN');
}

function announcementTarget(value: unknown, path: string): Announcement['target'] {
  if (value === 'all') return 'ALL';
  if (value === 'free') return 'FREE_ONLY';
  if (value === 'pro') return 'PRO_ONLY';
  return enumValue(value, ANNOUNCEMENT_TARGETS, path, 'ALL');
}

export function decodeUser(value: unknown, path = 'data'): User {
  const source = record(value, path);
  const id = string(first(source, 'id', 'uid'), `${path}.id`);
  const subscriptionValue = source.subscription;
  const subscription = subscriptionValue === undefined || subscriptionValue === null
    ? undefined
    : (() => {
      const item = record(subscriptionValue, `${path}.subscription`);
      return {
        stripeCustomerId: optionalString(first(item, 'stripeCustomerId', 'customerId'), `${path}.subscription.stripeCustomerId`),
        subscriptionId: optionalString(first(item, 'subscriptionId', 'providerSubscriptionId'), `${path}.subscription.subscriptionId`),
        autoRenew: optionalBoolean(item.autoRenew, `${path}.subscription.autoRenew`) ?? true,
        expiresAt: optionalDateString(first(item, 'expiresAt', 'currentPeriodEnd'), `${path}.subscription.expiresAt`),
        startedAt: optionalDateString(first(item, 'startedAt', 'currentPeriodStart'), `${path}.subscription.startedAt`),
      };
    })();

  return {
    id,
    uid: optionalString(source.uid, `${path}.uid`) ?? id,
    email: optionalString(source.email, `${path}.email`),
    name: optionalString(source.name, `${path}.name`),
    displayName: optionalString(source.displayName, `${path}.displayName`),
    firstName: optionalString(source.firstName, `${path}.firstName`),
    lastName: optionalString(source.lastName, `${path}.lastName`),
    plan: enumValue(source.plan, USER_PLANS, `${path}.plan`, 'FREE'),
    status: source.status === undefined
      ? (source.disabled === true ? 'SUSPENDED' : 'ACTIVE')
      : enumValue(source.status, USER_STATUSES, `${path}.status`, 'ACTIVE'),
    disabled: optionalBoolean(source.disabled, `${path}.disabled`) ?? false,
    emailVerified: optionalBoolean(source.emailVerified, `${path}.emailVerified`),
    country: optionalString(source.country, `${path}.country`),
    joinedDate: optionalDateString(source.joinedDate, `${path}.joinedDate`),
    createdAt: optionalDateString(source.createdAt, `${path}.createdAt`),
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
    lastLogin: optionalDateString(source.lastLogin, `${path}.lastLogin`),
    lastSignInAt: optionalDateString(source.lastSignInAt, `${path}.lastSignInAt`),
    device: optionalString(source.device, `${path}.device`),
    loginHistory: optionalArray(source.loginHistory, `${path}.loginHistory`, (entry, entryPath) => {
      const history = record(entry, entryPath);
      return {
        date: dateString(history.date, `${entryPath}.date`),
        ip: optionalString(history.ip, `${entryPath}.ip`),
        device: optionalString(history.device, `${entryPath}.device`),
      };
    }),
    subscription,
    journalCount: optionalNumber(source.journalCount, `${path}.journalCount`),
    tradeCount: optionalNumber(source.tradeCount, `${path}.tradeCount`),
    totalJournalsLogged: optionalNumber(source.totalJournalsLogged, `${path}.totalJournalsLogged`),
    totalTradesLogged: optionalNumber(source.totalTradesLogged, `${path}.totalTradesLogged`),
  };
}

export function decodeSubscription(value: unknown, path = 'data'): Subscription {
  const source = record(value, path);
  const userId = string(first(source, 'userId', 'uid', 'id'), `${path}.userId`);
  const providerSubscriptionId = optionalString(
    first(source, 'providerSubscriptionId', 'subscriptionId', 'lemonSqueezySubscriptionId'),
    `${path}.providerSubscriptionId`,
  );
  const status = normalizedSubscriptionStatus(first(source, 'status', 'lemonSqueezyStatus'), `${path}.status`);
  return {
    id: providerSubscriptionId ?? userId,
    userId,
    userEmail: optionalString(first(source, 'userEmail', 'email'), `${path}.userEmail`),
    userName: optionalString(first(source, 'userName', 'displayName'), `${path}.userName`),
    plan: enumValue(source.plan, USER_PLANS, `${path}.plan`, 'PRO'),
    status,
    autoRenew: optionalBoolean(source.autoRenew, `${path}.autoRenew`) ?? !['CANCELED', 'EXPIRED'].includes(status),
    customerId: optionalString(first(source, 'customerId', 'stripeCustomerId'), `${path}.customerId`),
    providerSubscriptionId,
    currentPeriodStart: optionalDateString(first(source, 'currentPeriodStart', 'startedAt'), `${path}.currentPeriodStart`),
    currentPeriodEnd: optionalDateString(first(source, 'currentPeriodEnd', 'expiresAt', 'planExpiry'), `${path}.currentPeriodEnd`),
    canceledAt: optionalDateString(source.canceledAt, `${path}.canceledAt`),
    createdAt: optionalDateString(source.createdAt, `${path}.createdAt`),
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
  };
}

export function decodePayment(value: unknown, path = 'data'): Payment {
  const source = record(value, path);
  return {
    id: string(source.id, `${path}.id`),
    userId: string(first(source, 'userId', 'uid'), `${path}.userId`),
    userName: optionalString(source.userName, `${path}.userName`),
    userEmail: optionalString(first(source, 'userEmail', 'email'), `${path}.userEmail`),
    amount: number(source.amount, `${path}.amount`),
    currency: optionalString(source.currency, `${path}.currency`) ?? 'USD',
    status: normalizedPaymentStatus(source.status, `${path}.status`),
    date: dateString(first(source, 'date', 'paidAt', 'createdAt'), `${path}.date`),
    stripeInvoiceId: optionalString(first(source, 'stripeInvoiceId', 'orderId'), `${path}.stripeInvoiceId`),
    providerPaymentId: optionalString(first(source, 'providerPaymentId', 'paymentId'), `${path}.providerPaymentId`),
    provider: optionalString(source.provider, `${path}.provider`),
    subscriptionId: optionalString(source.subscriptionId, `${path}.subscriptionId`),
    orderId: optionalString(source.orderId, `${path}.orderId`),
    refundedAmount: optionalNumber(source.refundedAmount, `${path}.refundedAmount`),
    type: optionalString(source.type, `${path}.type`),
    createdAt: optionalDateString(source.createdAt, `${path}.createdAt`),
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
    paidAt: optionalDateString(source.paidAt, `${path}.paidAt`),
    refundedAt: optionalDateString(source.refundedAt, `${path}.refundedAt`),
    description: optionalString(source.description, `${path}.description`),
  };
}

export function decodeReport(value: unknown, path = 'data'): Report {
  const source = record(value, path);
  return {
    id: string(source.id, `${path}.id`),
    userId: string(first(source, 'userId', 'uid'), `${path}.userId`),
    userEmail: optionalString(source.userEmail, `${path}.userEmail`),
    userName: optionalString(source.userName, `${path}.userName`),
    type: enumValue(source.type, REPORT_TYPES, `${path}.type`),
    subject: string(source.subject, `${path}.subject`),
    message: string(first(source, 'message', 'body'), `${path}.message`),
    status: normalizedReportStatus(source.status, `${path}.status`),
    createdAt: dateString(source.createdAt, `${path}.createdAt`),
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
    priority: source.priority === undefined ? undefined : enumValue(source.priority, ['LOW', 'MEDIUM', 'HIGH'] as const, `${path}.priority`),
    assigneeUid: optionalString(source.assigneeUid, `${path}.assigneeUid`),
    resolutionNote: optionalString(source.resolutionNote, `${path}.resolutionNote`),
    tradeId: optionalString(source.tradeId, `${path}.tradeId`),
    resolvedAt: optionalDateString(source.resolvedAt, `${path}.resolvedAt`),
  };
}

export function decodeCoupon(value: unknown, path = 'data'): Coupon {
  const source = record(value, path);
  const code = string(first(source, 'code', 'id'), `${path}.code`);
  return {
    id: optionalString(source.id, `${path}.id`) ?? code,
    code,
    discount: number(first(source, 'discount', 'discountValue'), `${path}.discount`),
    type: enumValue(first(source, 'type', 'discountType'), COUPON_TYPES, `${path}.type`),
    expiry: optionalDateString(first(source, 'expiry', 'expiresAt'), `${path}.expiry`),
    active: boolean(source.active, `${path}.active`),
    description: optionalString(source.description, `${path}.description`),
    currency: optionalString(source.currency, `${path}.currency`),
    maxRedemptions: optionalNumber(source.maxRedemptions, `${path}.maxRedemptions`),
    redeemedCount: optionalNumber(source.redeemedCount, `${path}.redeemedCount`) ?? 0,
    createdAt: optionalDateString(source.createdAt, `${path}.createdAt`),
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
  };
}

export function decodeAnnouncement(value: unknown, path = 'data'): Announcement {
  const source = record(value, path);
  return {
    id: string(source.id, `${path}.id`),
    title: string(source.title, `${path}.title`),
    body: string(source.body, `${path}.body`),
    target: announcementTarget(first(source, 'target', 'audience'), `${path}.target`),
    date: dateString(first(source, 'date', 'publishedAt', 'startsAt', 'createdAt'), `${path}.date`),
    active: source.active === undefined
      ? source.status === 'published'
      : boolean(source.active, `${path}.active`),
    status: enumValue(source.status, ANNOUNCEMENT_STATUSES, `${path}.status`, 'DRAFT'),
    level: enumValue(source.level, ANNOUNCEMENT_LEVELS, `${path}.level`, 'INFO'),
    linkUrl: optionalString(source.linkUrl, `${path}.linkUrl`),
    dismissible: optionalBoolean(source.dismissible, `${path}.dismissible`) ?? true,
    startsAt: optionalDateString(source.startsAt, `${path}.startsAt`),
    endsAt: optionalDateString(source.endsAt, `${path}.endsAt`),
    publishedAt: optionalDateString(source.publishedAt, `${path}.publishedAt`),
    createdAt: optionalDateString(source.createdAt, `${path}.createdAt`),
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
  };
}

export function decodeSettings(value: unknown, path = 'data'): SystemSettings {
  const source = record(value, path);
  return {
    supportEmail: optionalString(source.supportEmail, `${path}.supportEmail`) ?? 'support@xaujournal.com',
    allowRegistration: optionalBoolean(first(source, 'allowRegistration', 'signupsEnabled'), `${path}.allowRegistration`) ?? true,
    maintenanceMode: optionalBoolean(source.maintenanceMode, `${path}.maintenanceMode`) ?? false,
    trialDays: optionalNumber(source.trialDays, `${path}.trialDays`) ?? 0,
    announcementBannerEnabled: optionalBoolean(source.announcementBannerEnabled, `${path}.announcementBannerEnabled`) ?? true,
    reportsEnabled: optionalBoolean(source.reportsEnabled, `${path}.reportsEnabled`) ?? true,
    updatedAt: optionalDateString(source.updatedAt, `${path}.updatedAt`),
  };
}

export function decodeOverview(value: unknown, path = 'data'): Overview {
  const source = record(value, path);
  return {
    totalUsers: number(source.totalUsers, `${path}.totalUsers`),
    activeSubscriptions: number(source.activeSubscriptions, `${path}.activeSubscriptions`),
    totalPayments: number(source.totalPayments, `${path}.totalPayments`),
    openReports: number(source.openReports, `${path}.openReports`),
    generatedAt: dateString(source.generatedAt, `${path}.generatedAt`),
  };
}

export function decodeAnalytics(value: unknown, path = 'data'): Analytics {
  const source = record(value, path);
  const users = record(source.users, `${path}.users`);
  const payments = record(source.payments, `${path}.payments`);
  const reports = record(source.reports, `${path}.reports`);
  return {
    users: {
      total: number(users.total, `${path}.users.total`),
      free: number(users.free, `${path}.users.free`),
      pro: number(users.pro, `${path}.users.pro`),
      grace: number(users.grace, `${path}.users.grace`),
    },
    payments: {
      total: number(payments.total, `${path}.payments.total`),
      settled: number(payments.settled, `${path}.payments.settled`),
      failed: number(payments.failed, `${path}.payments.failed`),
      revenue: payments.revenue === null ? null : number(payments.revenue, `${path}.payments.revenue`),
    },
    reports: {
      open: number(reports.open, `${path}.reports.open`),
      resolved: number(reports.resolved, `${path}.reports.resolved`),
    },
    generatedAt: dateString(source.generatedAt, `${path}.generatedAt`),
  };
}
