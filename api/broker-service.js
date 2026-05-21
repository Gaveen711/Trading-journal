// api/broker-service.js
// MT4/MT5 Broker Connection Service
// Handles connection to broker servers via MT4/MT5 client protocol

import axios from 'axios';

/**
 * Broker adapter pattern - extend this for different brokers
 */
class MT4MT5BrokerAdapter {
  constructor(credentials) {
    this.login = credentials.login;
    this.password = credentials.password;
    this.server = credentials.server;
    this.brokerType = credentials.brokerType; // 'mt4' or 'mt5'
    this.baseUrl = this.resolveServerUrl(credentials.server);
  }

  /**
   * Resolve broker server to API endpoint
   * Example: ICMarkets-Live01 → https://api.icmarkets.com
   */
  resolveServerUrl(server) {
    // Map common broker server names to their API endpoints
    const brokerMap = {
      'ICMarkets-Live01': 'https://mt5-api.icmarkets.com', // Example - adjust per broker
      'Roboforex-Live': 'https://www.roboforex.com',
      'FXCM-Demo': 'https://api-demo.fxcm.com',
      // Add more brokers as needed
    };
    
    return brokerMap[server] || `https://${server}`;
  }

  /**
   * Authenticate and fetch closed trade history from broker
   * Returns array of closed trades
   */
  async fetchTradeHistory(fromDate = null) {
    try {
      // Step 1: Authenticate with broker server
      const authToken = await this.authenticate();
      if (!authToken) throw new Error('Authentication failed');

      // Step 2: Fetch closed trades (deals/orders)
      const trades = await this.getClosedTrades(authToken, fromDate);
      
      return trades;
    } catch (error) {
      console.error(`[broker-service] ${this.brokerType} fetch failed:`, error.message);
      throw error;
    }
  }

  /**
   * Authenticate against broker server
   * Returns auth token if successful
   */
  async authenticate() {
    try {
      const response = await axios.post(
        `${this.baseUrl}/auth/login`,
        {
          login: this.login,
          password: this.password,
          server: this.server,
        },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      return response.data.token || response.data.sessionId;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid broker credentials');
      }
      throw new Error(`Broker authentication error: ${error.message}`);
    }
  }

  /**
   * Fetch closed trades from broker account
   */
  async getClosedTrades(authToken, fromDate = null) {
    try {
      const params = new URLSearchParams();
      params.append('login', this.login);
      if (fromDate) {
        params.append('from', Math.floor(fromDate.getTime() / 1000));
      }

      const response = await axios.get(
        `${this.baseUrl}/api/accounts/${this.login}/deals`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          params,
          timeout: 15000,
        }
      );

      // Normalize response to standard trade format
      return this.normalizeTrades(response.data.deals || []);
    } catch (error) {
      console.error(`[broker-service] Failed to fetch trades:`, error.message);
      throw error;
    }
  }

  /**
   * Normalize broker-specific trade format to our standard
   */
  normalizeTrades(brokerTrades) {
    return brokerTrades.map(trade => ({
      positionId: trade.positionId || String(trade.ticket || trade.id),
      openDealTicket: trade.entry_ticket || trade.openTicket || null,
      closeDealTicket: trade.ticket || trade.dealTicket || null,
      symbol: trade.symbol,
      direction: (trade.type === 'BUY' || trade.type === 0) ? 'buy' : 'sell',
      lots: Number(trade.volume || trade.lots || 0),
      openPrice: Number(trade.open_price || trade.price_open || 0),
      closePrice: Number(trade.close_price || trade.price_close || 0),
      openTime: new Date(trade.time_open || trade.entry_time || trade.openTime).toISOString(),
      closeTime: new Date(trade.time_close || trade.exit_time || trade.closeTime).toISOString(),
      pnl: Number(trade.profit || trade.pnl || 0),
      commission: Number(trade.commission || trade.fee || 0),
      swap: Number(trade.swap || 0),
      status: 'closed',
      source: 'broker_login',
      brokerType: this.brokerType,
      brokerServer: this.server,
    }));
  }
}

/**
 * Create broker adapter based on broker type
 */
export function createBrokerAdapter(credentials) {
  return new MT4MT5BrokerAdapter(credentials);
}

/**
 * Fetch and return all closed trades from broker
 */
export async function fetchBrokerTrades(credentials, fromDate = null) {
  const adapter = createBrokerAdapter(credentials);
  return adapter.fetchTradeHistory(fromDate);
}

export default MT4MT5BrokerAdapter;
