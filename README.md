# MemeX Duelverse · Browser game portal

Next.js website for memexduelverse.com. The original branding, video and email
account provider are retained. Presale, coin, wallet and NFT navigation is hidden;
old purchase pages redirect to the game/shop. Creation of new presale PayPal orders
and legacy capture are disabled; purchase history is retained.

## Run and verify

`npm ci`, `npm test`, `npm run build`, `npm run start`.

Runtime patch baseline: Next.js 16.0.11, React/React DOM 19.1.10.

- `/play`: solo training and deck tests with three AI levels and optional 90-second
  turns. `/play?mode=duel` retains server-verified AI duels with Pixel rewards.
  Both launch the full-window arena; training and deck tests award no currencies or XP.
- `/account/private/profile`: one-time player name, 20 free meme portraits, level frames
  and earned titles. Profile and arena share the circular portrait renderer.
  Names require a verified account and explicit confirmation, ignore case and stay
  reserved after account deletion. Appearance saves cannot change or claim a name.
  Apply `202611200009_permanent_names87.sql` after the identity migration.
- `/collection`: common/rare/epic/legendary/mythic variants, owned quantities.
- `/decks`: exactly 15 owned copies, saved guest draft or authenticated cloud deck.
- `/account`: existing Supabase email authentication without wallet dependency.
- `/shop`: Boosters / Shards / Arena skins. Approved Shard prices, secure PayPal
  checkout and account-restricted sandbox testing; arena skins are concept placeholders.
  See [payment configuration](docs/shard-payments81.md). Live payments remain gated.

`public/game/platform/catalog.mjs` is the shared identity, variant and deck contract.
The SQL seed, React collection and game adapter use the same identifiers. Starter
allocation is provisional: six common copies per identity; default deck five each.
Rarity is cosmetic. Only three distinct gameplay identities currently have artwork.
The alpha deals five cards from 15 and allows nine placements per side, leaving six
cards unused. The paired round reuses draw order and reverses initiative.

## Current game status

The Alpha catalog now contains 85 motifs with five elements and five cosmetic
finishes (2,125 variants). Decks have exactly 15 owned cards, at most three copies
per motif. Registered players receive ten verified-email welcome boosters once.
Account-backed AI rounds use the trusted match service for 5/2 Pixel rewards.
Confirmed wins also grant 100 XP exactly once through the trusted reward ledger.
Level `L` starts at `250*(L-1)+5*(L-1)*(L-2)` XP; frames unlock at levels
50/100/150/200/250/300. Older unlocked frames can be equipped, or the newest frame
can equip automatically. XP and wins are never writable by clients. Apply
`202611200008_player_identity85.sql` after the preceding migrations; applied live
on 20 November 2026. Existing verified wins are included. Profile cosmetics in the
shop are previews only; premium and limited editions are not on sale yet.
Skill titles use verified round feats instead of early wins or player levels.
Double Trouble requires 50 turns with at least two captures; triple/quad captures,
comebacks, dominant wins and 2–0 double duels have separate milestones. Counters
commit once per completed server round. Local training, deck tests and abandoned
rounds never grant progress. Only retained complete older histories are recovered.
Apply `202611200010_skill_titles88.sql` after the name migration.
Booster purchases and openings are saved atomically; paid currency is separately
verified by the payment service. Return rounds reshuffle both decks.

The foundation notes below describe the original v01 baseline, not current limits.

## Database

Apply `supabase/migrations/202611180001_duelverse_foundation.sql` once to the existing
project `vnwvwwukqlbwzqroaqeu`. Applied on 18 November 2026; live checks confirm
three card identities, 15 cosmetic variants, eight row-protected tables and no
anonymous starter function access. It adds only `dv_` tables and narrow authenticated RPCs.
No change to existing accounts or presale tables. Starter allocation is transactional
and idempotent. Player tables have row security; clients cannot mint cards, currencies,
cosmetics or match rewards. Deck save validates ownership and exact size in PostgreSQL,
locks the player row and activates one deck atomically. Tests execute the migration in
local PostgreSQL-compatible PGlite, including cross-account attacks and invalid saves.

Earned and premium balances, a unique-event reward ledger and cosmetic ownership are
prepared. No public reward/credit RPC exists. Do not connect rewards to local alpha
results: an authoritative match service is required first. Boosters, paid currency and
a later battle pass remain future features; no payout rates or prices are approved.

## Game integration and privacy

`public/game` is a separate copy of the approved private prototype. The original
owner-private Sites project and audience remain unchanged. This copy runs publicly
under the website's origin, without a ChatGPT gate. Game images are optimized WebP;
source artwork remains in the original project. The original Three.js license is kept.

The guest draft and selected alpha deck use namespaced browser storage, never as
proof of account ownership. Logged-in collection and decks use the existing Supabase
session and protected RPCs. The alpha opponent is local AI; online PvP, verified match
results, rewards, booster purchases and ranked progression are not implemented.

Publish through the repository's existing Vercel deployment, preserving the domain.
Do not move the public site to Sites or change the private prototype's permissions.

## Visual integration contract

Preserve the original homepage composition, large centered logo, existing videos,
floating navigation, animated card showcase, section styles and social/news pages.
Coin/presale UI stays hidden; only copy and navigation needed for the game changes.
All added portal CSS must stay inside `.dv-portal`; it must never restyle the
existing homepage or shared website elements. Use existing branded video backdrops
for new game/account pages. A site redesign requires an explicit request.
