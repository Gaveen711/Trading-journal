/**
 * Simple feature gating helpers for UI components.
 */
export function requireProFeature(plan, showPricingModal, toast, featureName = 'this feature') {
  const isPro = plan === 'pro' || plan === 'grace';
  if (isPro) return true;

  // Show upsell modal and toast for non-pro users
  if (typeof showPricingModal === 'function') showPricingModal(true);
  if (typeof toast === 'function') toast(`Upgrade to Pro to use ${featureName}.`, 'warn');
  return false;
}
