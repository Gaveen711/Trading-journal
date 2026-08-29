import type { AdminDataFreshness, IsoDateString, PaginationParams } from './common';

export interface UserAnalyticsSummary {
  tradeCount: number;
  wins: number;
  losses: number;
  breakEven: number;
  winRate: number | null;
  totalPnl: number;
  totalPips: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  expectancy: number | null;
  longs: number;
  shorts: number;
  journalCount: number;
}

export interface UserAnalyticsTimeSeriesPoint {
  date: IsoDateString;
  tradeCount: number;
  wins: number;
  losses: number;
  breakEven: number;
  totalPnl: number;
  cumulativePnl?: number;
}

export interface UserAnalyticsBreakdown {
  key: string;
  name: string;
  tradeCount: number;
  wins: number;
  losses: number;
  breakEven: number;
  winRate: number | null;
  totalPnl: number;
  expectancy: number | null;
}

export type AdminTradeStatus = 'OPEN' | 'CLOSED' | 'UNKNOWN';
export type AdminTradeDirection = 'BUY' | 'SELL' | 'UNKNOWN';
export type AdminTradeOutcome = 'WIN' | 'LOSS' | 'BREAK_EVEN' | 'UNKNOWN';

export interface UserAnalyticsTrade {
  id: string;
  symbol?: string;
  status: AdminTradeStatus;
  direction: AdminTradeDirection;
  outcome: AdminTradeOutcome;
  openedAt?: IsoDateString;
  closedAt?: IsoDateString;
  pnl?: number;
  pips?: number;
  setup?: string;
  session?: string;
}

export interface UserAnalytics {
  summary: UserAnalyticsSummary;
  timeSeries: UserAnalyticsTimeSeriesPoint[];
  setups: UserAnalyticsBreakdown[];
  sessions: UserAnalyticsBreakdown[];
  recentTrades: UserAnalyticsTrade[];
  nextPageToken?: string;
  generatedAt: IsoDateString;
  freshness: AdminDataFreshness;
}

export interface UserAnalyticsParams extends PaginationParams {
  from?: IsoDateString;
  to?: IsoDateString;
}
