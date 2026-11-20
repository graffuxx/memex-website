# Shard checkout (v81)

The approved one-time EUR packages are 150/1.99, 800/9.99 and 1800/19.99.
`public/game/platform/shard-packs81.mjs` is the public price list. PostgreSQL
snapshots the approved package; the browser never chooses the credited amount.

Apply `supabase/migrations/202611200007_shard_payments81.sql` after earlier
migrations. Only service_role can prepare or fulfill purchases. No existing wallet
balances, decks, cards or presale records are migrated. Both retired presale
purchase endpoints now return 410.

## Server settings

Use the existing Vercel project. Never commit credentials or put a secret in a
NEXT_PUBLIC variable. These settings are server-only:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: existing project connection.
- `DV_SHARD_PAYMENTS_ENABLED=true`: explicit checkout switch; unset is disabled.
- `DV_SHARD_PAYMENT_MODE=sandbox` or `live`: independent of legacy presale settings.
- Sandbox: `PAYPAL_SANDBOX_CLIENT_ID`, `PAYPAL_SANDBOX_CLIENT_SECRET`,
  `PAYPAL_SANDBOX_MERCHANT_ID`, `PAYPAL_SANDBOX_WEBHOOK_ID`.
- `DV_SHARD_SANDBOX_USER_ID`: required designated account UUID for private tests.
- Live: existing `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, plus
  `PAYPAL_MERCHANT_ID` and `PAYPAL_WEBHOOK_ID`. All must match one merchant/app.

Sandbox and live orders are separate. Sandbox is account restricted and cannot
credit playable Shards. Live requires its own webhook ID before checkout enables.
Do not activate live until a real provider sandbox approval/capture/reload test
passes, and seller/contact and digital-content checkout requirements are completed.

Webhook URL: `https://www.memexduelverse.com/api/shop/paypal/webhook`
Subscribe to PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.REFUNDED,
PAYMENT.CAPTURE.REVERSED. The handler verifies signatures via PayPal, re-fetches
completed order receipts and checks merchant, metadata, currency and full amount.
Do not attach live events while the service is in sandbox mode.

## Recovery and accounting

The local request UUID is persisted per user and environment. PayPal order creation
and capture each use stable request IDs. A paid order can be restored without a
second capture. Purchase, capture and ledger constraints prevent duplicate credit.
The server-owned purchase log stays available after browser storage is cleared.

Verified partial/full refunds proportionally reclaim Shards. Already-spent refunded
Shards become server-only debt, settled against later purchases; wallet balances
never become negative. No refund is initiated by this integration.

`tests/shard-payments81.test.mjs` verifies SQL permissions, cross-account isolation,
receipt tampering, capture recovery, sandbox isolation, refunds/debt and forged
webhooks. Provider sandbox end-to-end testing is additional, not replaced by mocks.
