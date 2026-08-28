# MT4/MT5 Broker Login Sync Implementation

## Overview

This implementation enables users to connect their MT4/MT5 broker accounts directly to xaujournal without requiring an Expert Advisor. The system automatically pulls closed trade history from broker servers every 30-60 seconds.

## How It Works

### Flow Diagram

```
User enters: login / password / server (e.g., ICMarkets-Live01)
       ↓
Backend connects to broker server via MT4/MT5 client protocol
       ↓
Authenticates using credentials
       ↓
Pulls closed trade history (deals/orders)
       ↓
Stores to Firebase and maps to journal entries
       ↓
Periodic polling (every 60 seconds) fetches new trades
```

## Architecture

### Backend Components

#### 1. **Broker Service** (`api/_metaapi-broker.js`)
- `MT4MT5BrokerAdapter`: Base class for broker connections
- Handles authentication with broker servers
- Normalizes trade data across different brokers
- Supports both MT4 and MT5 protocols

**Key Methods:**
- `fetchTradeHistory(fromDate)`: Fetch closed trades from broker
- `authenticate()`: Authenticate with broker server
- `getClosedTrades(authToken, fromDate)`: Pull deals/orders
- `normalizeTrades()`: Convert broker format to standard format

#### 2. **API Endpoint** (`api/broker-login-sync.js`)
- Handles broker account CRUD operations
- Manages encrypted credential storage
- Routes requests to appropriate handlers

**Actions:**
- `add`: Add new broker account (with credential validation)
- `list`: List user's connected broker accounts
- `sync`: Manually trigger sync for an account
- `remove`: Disconnect a broker account

**Security:**
- Credentials encrypted with Base64 encoding (should upgrade to AES-256 in production)
- Plan validation (Pro subscription required)
- API key required for access

#### 3. **Cron Job** (`api/cron/broker-sync-poller.js`)
- Runs every 60 seconds (via Vercel cron)
- Iterates through all users and their broker accounts
- Fetches new trades since last sync
- Updates account sync status
- Handles errors gracefully with retry logic

**Process:**
1. Get all users with active subscriptions
2. For each user's active broker account:
   - Skip if synced within last 30 seconds
   - Fetch trades from broker
   - Store to Firebase `trades` collection
   - Update sync metadata (lastSyncTime, status, count)

### Frontend Components

#### 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`)
- Main sync configuration UI with tab switcher
- Three tabs: MT5 EA, Broker Login, TradingView
- Displays broker login instructions
- Links to separate BrokerLoginSync component

#### 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`)
- Self-contained broker account management UI
- Add broker account form with validation
- List connected accounts with sync status
- Manual sync trigger and account removal
- Displays last sync time and trade count

**Features:**
- Broker preset selection (ICMarkets, Roboforex, FXCM, etc.)
- Password visibility toggle
- Real-time sync status indicators
- Encrypted credential storage indication

#### 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`)
- React hook for managing broker account state
- CRUD operations for accounts
- Error handling and loading states
- Integration with BrokerLoginSync component

**Methods:**
- `loadAccounts()`: Fetch user's broker accounts
- `addAccount(login, password, server, brokerType)`: Connect new account
- `syncAccount(accountId)`: Manually sync an account
- `removeAccount(accountId)`: Disconnect an account

### Database Schema

#### Firestore Collections

**`users/{uid}/brokerAccounts/{accountId}`**
```javascript
{
  id: string,                    // Document ID
  accountName: string,           // User-friendly name
  brokerType: 'mt4' | 'mt5',
  server: string,               // Broker server (e.g., "ICMarkets-Live01")
  login: string,                // Broker login number
  encryptedPassword: string,    // Base64 encoded password
  isActive: boolean,
  lastSyncTime: timestamp,
  lastSyncStatus: 'pending' | 'success' | 'failed',
  lastSyncError?: string,
  tradeCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

**`users/{uid}/trades/{tradeId}`**
- Synced trades are stored with source: 'broker_login'
- Fields include: positionId, symbol, direction, lots, openPrice, closePrice, openTime, closeTime, pnl, commission, swap, etc.
- accountId references the source broker account

## API Reference

### POST /api/broker-login-sync

#### Add Broker Account
```json
{
  "uid": "user123",
  "action": "add",
  "login": "12345",
  "password": "password123",
  "server": "ICMarkets-Live01",
  "brokerType": "mt5",
  "accountName": "Main Account"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Broker account added successfully",
  "accountId": "account123",
  "tradeCount": 25
}
```

#### List Broker Accounts
```json
{
  "uid": "user123",
  "action": "list"
}
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "account123",
      "accountName": "Main Live Account",
      "brokerType": "mt5",
      "server": "ICMarkets-Live01",
      "login": "12345",
      "isActive": true,
      "lastSyncTime": "2024-05-21T10:30:00Z",
      "lastSyncStatus": "success",
      "tradeCount": 42
    }
  ]
}
```

#### Manual Sync
```json
{
  "uid": "user123",
  "action": "sync",
  "accountId": "account123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Broker trades synced successfully",
  "newTrades": 3,
  "updatedTrades": 0,
  "totalFetched": 3
}
```

#### Remove Account
```json
{
  "uid": "user123",
  "action": "remove",
  "accountId": "account123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Broker account removed"
}
```

## Configuration

### Environment Variables

Create `.env.local`:
```env
VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"..."}
ENCRYPTION_KEY=your-encryption-key-here
CRON_SECRET=your-cron-secret-here
```

### Vercel Cron Setup

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/broker-sync-poller",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

## Supported Brokers

Currently configured brokers:

| Broker | Server Name | Type | API Endpoint |
|--------|------------|------|--------------|
| ICMarkets | ICMarkets-Live01 | MT5 | https://mt5-api.icmarkets.com |
| Roboforex | Roboforex-Live | MT4 | https://www.roboforex.com |
| FXCM | FXCM-Demo | MT5 | https://api-demo.fxcm.com |

To add new MetaAPI configurations, update `_metaapi-broker.js`:
```javascript
const brokerMap = {
  'YourBroker-Live': 'https://your-broker-api.com',
  // ...
};
```

## Security Considerations

1. **Credential Storage**: Passwords are encrypted before storage (upgrade to AES-256)
2. **No Fund Access**: System only reads trade history, cannot withdraw or trade
3. **Plan Validation**: Feature requires Pro subscription
4. **Rate Limiting**: Minimum 30 seconds between syncs per account
5. **Error Handling**: Failed syncs don't crash the system, logged with status

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid broker credentials" | Wrong login/password/server | Verify credentials in broker terminal |
| "Broker sync requires active Pro subscription" | Expired plan | Renew Pro subscription |
| "Failed to connect to broker" | Network/server down | Retry later, check broker status |
| "Authentication failed" | Broker server rejected auth | Check login credentials format |

## Performance

- **Sync Frequency**: Every 60 seconds (configurable)
- **Per-Account Rate Limit**: 30 seconds minimum between syncs
- **Batch Processing**: All users processed in single cron run
- **Database Writes**: Batch operations reduce Firestore costs
- **Data Retention**: Historical trades retained indefinitely

## Future Enhancements

1. **Multi-Account Support**: Sync from multiple broker accounts simultaneously
2. **Advanced Encryption**: Upgrade to AES-256 for credentials
3. **Broker Adapters**: Add more broker APIs (Oanda, IG, Saxo, etc.)
4. **Webhook Support**: Real-time trade sync from broker webhooks
5. **Trade Matching**: Automatically match broker trades with manual entries
6. **Audit Logging**: Track all sync operations and failures
7. **User Notifications**: Alert users when sync fails

## Troubleshooting

### Trades Not Syncing

1. Check last sync status in BrokerLoginSync UI
2. Verify broker account is marked active
3. Click "Manual Sync Now" to test connection
4. Check browser console for API errors
5. Verify subscription is active (Pro plan)

### Slow Sync

1. Check Vercel cron job status: Deployment logs
2. Verify broker server is responsive
3. Check Firebase Firestore limits (reads/writes)
4. Review sync error messages in account status

### Credential Issues

1. Ensure password doesn't contain special characters that need encoding
2. Verify server name matches exactly (case-sensitive on some brokers)
3. Test login in actual MT4/MT5 terminal first
4. Check broker server connection status

## Testing

### Manual Testing

```javascript
// Test broker service
const adapter = createBrokerAdapter({
  login: '12345',
  password: 'test',
  server: 'ICMarkets-Live01',
  brokerType: 'mt5'
});

const trades = await adapter.fetchTradeHistory();
console.log('Fetched trades:', trades);
```

### Unit Tests

See `api/_sync-trade.test.js` for example test structure. Create similar tests for broker sync:

```javascript
describe('MT4MT5BrokerAdapter', () => {
  it('should authenticate with valid credentials');
  it('should fetch and normalize trades');
  it('should handle invalid credentials gracefully');
});
```

## Monitoring

### Vercel Analytics

1. Check cron job success/failure rate in Deployments
2. Monitor API response times
3. Track Firestore read/write operations
4. Review error logs for patterns

### Firebase Monitoring

1. Monitor Firestore quota usage
2. Track collection growth (`users/{uid}/trades`)
3. Set up alerts for high error rates

## Integration with Existing Features

- **useTrades Hook**: Already detects `source: 'broker_login'` trades
- **Trade Journal**: Synced trades appear automatically
- **Analytics**: Included in portfolio calculations
- **History**: Searchable and filterable like manual trades
- **Exports**: Included in data exports

## API Authentication

All endpoints require Firebase authentication:
- Include Firebase ID token in `Authorization: Bearer {token}` header
- Validate user subscription status (Pro plan required)
- Rate limit per user (100 requests/minute)

## File Structure

```
api/
  ├── _metaapi-broker.js         # Broker connection logic
  ├── [...route].ts            # Hono API endpoints (connect, sync, success, etc.)
  └── cron/
      └── broker-sync-poller.js  # Periodic sync job (mapped via vercel.json)

src/
  ├── components/
  │   ├── MT5SyncSetup.jsx       # Sync settings UI
  │   ├── BrokerLoginSync.jsx    # Broker account mgmt UI
  │   └── BrokerSync.jsx            # Updated to include both
  └── hooks/
      └── useBrokerAccounts.js   # React hook for accounts

vercel.json                       # Cron configuration
```

## Version History

- **v1.0.0** (May 21, 2026): Initial implementation
  - Basic MT4/MT5 broker connection
  - Credential encryption
  - Periodic polling via cron
  - UI for account management
  - Firebase integration

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error messages in Firebase Logs
3. Test credentials in actual MT4/MT5 terminal
4. Contact support with account details (without passwords)
