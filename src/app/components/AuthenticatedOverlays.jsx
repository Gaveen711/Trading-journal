import { ConsentModal } from '../../components/ConsentModal.jsx';
import { OnboardingModal } from '../../components/OnboardingModal.jsx';
import { PricingModal } from '../../components/PricingModal.jsx';
import { ProFeatureUpsellModal } from '../../components/ProFeatureUpsellModal.jsx';

/** Keeps modal policy outside authenticated routing and page components. */
export function AuthenticatedOverlays({ modalState, onboarding, subscription, showConsent }) {
  return (
    <>
      {modalState.pricing && (
        <PricingModal
          plan={subscription.plan}
          expiry={subscription.expiry}
          isTrial={subscription.isTrial}
          isTrialExpired={subscription.isTrialExpired}
          onSubscribe={subscription.startCheckout}
          recordProAcceptance={subscription.recordProAcceptance}
          onClose={modalState.closePricing}
        />
      )}
      {modalState.brokerSyncUpsell && (
        <ProFeatureUpsellModal
          feature="broker-sync"
          plan={subscription.plan}
          onSubscribe={subscription.startCheckout}
          recordProAcceptance={subscription.recordProAcceptance}
          onClose={modalState.closeBrokerSyncUpsell}
        />
      )}
      {onboarding.isOpen && <OnboardingModal onComplete={onboarding.complete} onClose={onboarding.dismiss} />}
      {showConsent && <ConsentModal onAgree={subscription.agreeToTerms} />}
    </>
  );
}
