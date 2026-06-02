import { TradeEntity } from '../domain/entities/Trade.js';

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

    const enrichedTrade = {
      ...tradeData,
      pnl: metrics.pnl,
      rr: metrics.rr,
      pips: metrics.pips,
      swap: metrics.swap,
      outcome: metrics.pnl > 0.01 ? 'WIN' : metrics.pnl < -0.01 ? 'LOSS' : 'BE',
      timestamp: tradeData.timestamp || new Date()
    };

    return this.tradeRepository.addTrade(userId, enrichedTrade);
  }
}
