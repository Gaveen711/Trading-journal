# MetaApi token (Firebase Secrets)

The MetaApi token must **only** live on Cloud Functions — never in React (`VITE_*`), never in git.

## Production

```bash
# From repo root (requires Firebase CLI + logged in)
firebase functions:secrets:set META_API_TOKEN
```

Paste your token when prompted ([MetaApi → API access](https://app.metaapi.cloud/api-access/generate-token)).

Deploy so functions pick up the secret:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Local emulator

```bash
cd functions
cp .env.example .env
# Edit .env and set META_API_TOKEN=your_token
firebase emulators:start --only functions
```

The emulator reads `META_API_TOKEN` from `functions/.env` for local testing.

## Verify

After deploy, connect a broker from **App → Sync → Broker Login**. If the secret is missing, the client will show an error mentioning `META_API_TOKEN`.

## Rotate token

```bash
firebase functions:secrets:set META_API_TOKEN
firebase deploy --only functions
```
