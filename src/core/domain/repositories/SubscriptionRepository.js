export class SubscriptionRepository {
  subscribeToUserDoc(_userId, _onUpdate, _onError) {
    throw new Error('subscribeToUserDoc not implemented');
  }

  recordProAcceptance(_userId) {
    throw new Error('recordProAcceptance not implemented');
  }

  agreeToTerms(_userId) {
    throw new Error('agreeToTerms not implemented');
  }
}
