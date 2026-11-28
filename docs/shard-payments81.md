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

## Provider test evidence · 20 November 2026

On the deployed website the designated account completed sandbox purchases for
150 Shards / EUR 1.99 and 800 Shards / EUR 9.99 using the existing PayPal sandbox
buyer. The second checkout was interrupted by a page reload and resumed with the
same PayPal order ID. Both purchases display as completed in the account history.
Real wallet Shards and paid-credit ledger entries remained zero. The price/recipient
checks ran against actual provider receipts, not just the mocked test fixtures.
Public/live purchases remain disabled; only the designated account sees sandbox
checkout. Merchant disclosures and live webhook configuration are still pending.

## Supporter checkout test

Support the Duelverse lives at `/support`. It uses the same PayPal order and
receipt verification as Shards with separate supporter orders. The Supporter
handler is sandbox-only, even when the Shard handler is configured for live.

For an isolated preview, apply `202611280006_supporter_sandbox.sql` and
`202611280007_supporter_cash_cow.sql` with the base migrations to the test database. Set `DV_SUPPORTER_SANDBOX_ENABLED=true`,
`DV_SUPPORTER_SANDBOX_DB_URL`, `DV_SUPPORTER_SANDBOX_DB_KEY` (server role),
and `DV_SUPPORTER_SANDBOX_USER_ID` to the confirmed test account in that project.
Build the preview with the matching
`NEXT_PUBLIC_SUPPORTER_SANDBOX_DB_URL` and
`NEXT_PUBLIC_SUPPORTER_SANDBOX_PUBLISHABLE_KEY` for test login and inventory.
Reuse the existing `PAYPAL_SANDBOX_*` app settings. The checkout refuses the
production game database. Keep the preview settings separate from production.

Once a sandbox receipt is verified, the database appends the approved Alpha
boosters and unlocks the pack's portrait, title and any exclusive sticker in one transaction. A repeat
capture check returns the same rewards. The optional `/api/support/checkout/webhook`
accepts verified sandbox completion events. Production payment and refund support
are outside this sandbox implementation.

`tests/supporter-payments.test.mjs` exercises all four packages with simulated
provider responses and the actual database migrations. It does not make an
external PayPal test transaction.
