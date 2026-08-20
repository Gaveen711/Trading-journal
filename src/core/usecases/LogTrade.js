import { TradeEntity } from '../domain/entities/Trade.js';
import { SESSION_ENGINE_VERSION, resolveSessionAt } from '../../lib/sessionEngine.js';
import { entryMoment } from '../../lib/tradeAnalytics.js';

export class LogTradeUseCase {
  constructor(tradeRepository) {
    this.tradeRepository = tradeRepository;
  }

  async execute(userId, tradeData) {
    TradeEntity.validate(tradeData);

    const metrics = TradeEntity.calcPnl(
      tradeData.entry,
      tradeData.exit,
      tradeData.lots,
      tradeData.actualPnl,
      tradeData.sl,
      tradeData.tp,
      tradeData.direction,
      tradeData.swap
    );

    // Log time is the only instant a manually logged trade has, so it is both
    // the stored `timestamp` and the entry instant the session tag resolves
    // from — one variable, so the two can never disagree. entryMoment supplies
    // the coercion ladder (Date, Timestamp, ISO, epoch ms) rather than a bare
    // `new Date(...)`, and answers null for anything unusable.
    const loggedAt = tradeData.timestamp || new Date();
    const loggedMs = entryMoment({ timestamp: loggedAt });

    // resolveSessionAt(...)?.code is the only sanctioned way to produce a
    // stored tag: it returns a SESSION_CODES member or null, never the
    // 'Unknown' analytics bucket, which firestore.rules' enum would reject —
    // and a rejected trade write fails the whole batch.
    const enrichedTrade = {
      ...tradeData,
      pnl: metrics.pnl,
      rr: metrics.rr,
      pips: metrics.pips,
      swap: metrics.swap,
      outcome: metrics.pnl > 0.01 ? 'WIN' : metrics.pnl < -0.01 ? 'LOSS' : 'BE',
      timestamp: loggedAt,
      entryTimestampUtc: loggedMs === null ? null : new Date(loggedMs).toISOString(),
      sessionCode: resolveSessionAt(loggedMs)?.code ?? null,
      sessionSource: 'manual-logtime',
      sessionEngineVersion: SESSION_ENGINE_VERSION,
      // Explicit null rather than an absent key: getTradeSetupKey and the rules'
      // ≤64 bound both read this field, and Firestore rejects undefined outright.
      setupId: tradeData.setupId || null,
    };

    return this.tradeRepository.addTrade(userId, enrichedTrade);
  }
}
