# Duelverse search and opponent adaptation

`ismcts135.mjs` implements an observer information-set Monte Carlo tree search with
stochastic opponent-model transitions, heuristic-guided progressive widening,
UCB selection, terminal rollouts and reward back-propagation. It is a custom
integration of the approach described by Cowling, Powley and Whitehouse (2012),
DOI `10.1109/TCIAIG.2012.2200894`; it does not import OpenSpiel or a pretrained model.

Each simulation samples an unknown opponent deck from released native motifs,
respecting revealed cards, singleton, two-Iconic and one-Prime limits. The bot knows its own
saved deck composition, but its draw order is independently sampled. Search nodes
contain public board state and the observing bot's hand. Simulation moves resolve
through the same `placeEffect` rules as authoritative moves. This release searches
card placements, including abilities, and responds to player blockade changes;
the bot does not yet plan its own optional blockade moves.

`opponent-model135.mjs` updates bounded evidence for aggressive, defensive and
balanced placement preferences, conditional on the card just revealed. It never
reads the player's remaining hand or saved deck. Only accepted manual placements
update it; duplicate requests and AFK placements do not. Evidence is stored in the
duel's server-side `bot96` state and survives round changes and reconnects. It is
not cross-account training, neural training or persistent learning across duels.

Random uses the bounded `standard` budget. Exported `casual` and `tower` budgets
are calibration hooks, not an implemented Tower mode or certified skill ratings.
Budget exhaustion returns a legal heuristic move; server timeout rules still win.
Search telemetry and raw learning evidence are not projected to the other player.

Checks: `node --test tests/ismcts135.test.mjs tests/random-ai96.test.mjs`.
Paired-seat comparison: `node scripts/audit-ismcts135.mjs 20 160`.

Alpha completion 136 adds the 20 released Iconics to both the real opponent pools
and hidden-world simulations. Numeric values and element tiebreaks still use the
shared capture resolver; no separate rules or stronger cosmetic finishes apply.
