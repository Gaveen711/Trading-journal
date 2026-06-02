export class ResetTradesUseCase {
  constructor(tradeRepository) {
    this.tradeRepository = tradeRepository;
  }

  async execute(userId, idToken) {
    if (!userId) throw new Error('Not authenticated');
    return this.tradeRepository.resetTrades(userId, idToken);
  }
}
