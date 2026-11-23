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
The SQL seed, React collection and game adapter use the same identifiers. New accounts
start with 15 unique common motifs. The alpha deals five cards from 15 and allows
nine placements per side, leaving six cards unused. Return rounds reshuffle.

## Current game status

The Alpha catalog contains 95 motifs, each in its native element with five cosmetic
finishes (475 Alpha variants, plus two recruiter rewards). Ten motifs are Prime cards,
with one S-ranked side each. Decks require exactly 15 different owned motifs and at
most one Prime, across all finishes. S beats numeric edges and only loses to a
stronger-element S. Numeric field and ability bonuses cannot create an S rank.
Registered players receive ten verified-email welcome boosters once. Duplicate
protection prioritizes variants never acquired before within each rolled finish;
only after that finish is complete can it produce duplicates. Dismantling does not
reset acquisition history. Apply `202611230001_primes_singleton126.sql` after the
native-element migration. Existing ownership, wallets and active matches remain;
old duplicate decks must be explicitly rebuilt before starting a new duel.
Account-backed AI rounds use the trusted match service for 5/2 Pixel rewards.
Confirmed wins also grant 100 XP exactly once through the trusted reward ledger.
Level `L` starts at `250*(L-1)+5*(L-1)*(L-2)` XP; frames unlock at levels
50/100/150/200/250/300. Older unlocked frames can be equipped, or the newest frame
can equip automatically. XP and wins are never writable by clients. Apply
`202611200008_player_identity85.sql` after the preceding migrations; applied live
on 20 November 2026. Existing verified wins are included. Profile cosmetics in the
shop are previews only; premium and limited editions are not on sale yet.
Skill titles use verified Random PvP round feats instead of early wins or player levels.
Double Trouble requires 50 turns with at least two captures; triple/quad captures,
comebacks, dominant wins and 2–0 double duels have separate milestones. Counters
commit once per completed server round. Local training, deck tests and abandoned
rounds never grant progress. Earlier AI statistics remain in the audit tables but no longer count toward titles.
Apply `202611200010_skill_titles88.sql` after the name migration.
Then apply `202611200011_quad_luck89.sql`: Four of a Kind needs one quad flip;
Your Final Boss needs 50 triple-flip turns and 50 double-duel sweeps, with no quad requirement.
Apply `202611200012_matchmaking90.sql` next. `/play` offers real Random pairing,
private invitation duels, and disabled Ranked (Coming soon). The existing Vercel
server uses `SUPABASE_SERVICE_ROLE_KEY` for `/api/duel`; no browser receives this key.
One active match per account; both decks are checked and frozen at pairing. Only
own hand and played cards are revealed; future draws and opponent cards stay hidden.
Server deadlines enforce 90-second turns; after two missed own turns, subsequent turns allow three seconds until a legal manual placement. Return rounds start automatically after eight seconds,
and reconnect restores the saved board. Only completed Random rounds grant titles
and 5/2 Pixels; private matches grant no currencies, XP or titles. Random has no AI
fallback or skill rating yet. Run `node scripts/preview-matchmaking90.mjs` for isolated
two-tab QA with disposable accounts (loopback only, no production credentials).
Apply `202611210001_friends92.sql` for account-scoped friends, exact-name lookup,
explicit friend requests and recipient-bound private duel invitations. Friends are
under `/account/private/friends`, with notification counts in the account and play
navigation. Blocks/removals cancel waiting invitations; ongoing duels keep their
state. Private rooms expire after 15 inactive minutes (Random queue: 120 seconds).
`node scripts/preview-friends92.mjs` runs isolated three-account browser QA on
loopback with a disposable database; it never uses production credentials.
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

## 23 November gameplay update (129)

Normal matches disable event fields and random field-stat changes. Dormant field support
shows +1 field strengths directly over affected card edges when re-enabled in QA.
The HUD separates round wins/completed rounds from controlled-card scores. Surrender
is explicit, Leave Duel is highlighted, results show both winner/loser perspectives
and return to matchmaking after five seconds. Native card-hover tooltips are removed;
hover enlargement and accessible card names remain. Website sound toggle removed;
game audio and interactive booster effects retain their own behavior.

Apply `202611230002_collection_quests129.sql` for lifetime unique-motif milestones
25/50/95, each granting one profile portrait and title after an explicit claim.
XP cannot bypass those locks; retries cannot multiply rewards. Apply
`202611230003_replace_salt_bae129.sql` for Let Him Cook (stable salt-bae IDs,
unchanged values/element and five replacement artworks). Existing ownership is retained.
Validation: 186 automated tests; isolated two-client browser round, automatic next
round, surrender and automatic lobby return; production build.
