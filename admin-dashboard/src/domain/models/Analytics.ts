export interface Analytics {
  users: {
    total: number;
    free: number;
    pro: number;
    grace: number;
  };
  payments: {
    total: number;
    settled: number;
    failed: number;
    revenue: number | null;
  };
  reports: {
    open: number;
    resolved: number;
  };
  generatedAt: string;
}
