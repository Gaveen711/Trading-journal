import { LogTradeUseCase } from '../../core/usecases/LogTrade.js';
import { ResetTradesUseCase } from '../../core/usecases/ResetTrades.js';
import { FirebaseBrokerRepository } from '../../data/repositories/FirebaseBrokerRepository.js';
import { FirebaseJournalRepository } from '../../data/repositories/FirebaseJournalRepository.js';
import { FirebaseSubscriptionRepository } from '../../data/repositories/FirebaseSubscriptionRepository.js';
import { FirebaseTradeRepository } from '../../data/repositories/FirebaseTradeRepository.js';
import { FirebaseWalletRepository } from '../../data/repositories/FirebaseWalletRepository.js';
import { auth } from '../../firebase.js';

/** Application composition root: the only frontend module selecting infrastructure adapters. */
export function createAppServices(overrides = {}) {
  const tradeRepository = overrides.tradeRepository ?? new FirebaseTradeRepository();
  return Object.freeze({
    auth: overrides.auth ?? auth,
    brokerRepository: overrides.brokerRepository ?? new FirebaseBrokerRepository(),
    journalRepository: overrides.journalRepository ?? new FirebaseJournalRepository(),
    subscriptionRepository: overrides.subscriptionRepository ?? new FirebaseSubscriptionRepository(),
    tradeRepository,
    walletRepository: overrides.walletRepository ?? new FirebaseWalletRepository(),
    // Optional: useSetups reaches Firestore directly when this is null (see the
    // adapter in that hook). Only an override — today the dev-only showcase —
    // supplies one.
    setupRepository: overrides.setupRepository ?? null,
    logTradeUseCase: overrides.logTradeUseCase ?? new LogTradeUseCase(tradeRepository),
    resetTradesUseCase: overrides.resetTradesUseCase ?? new ResetTradesUseCase(tradeRepository),
  });
}
