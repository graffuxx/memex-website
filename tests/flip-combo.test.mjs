import test from 'node:test';
import assert from 'node:assert/strict';
import { animateResolvedFlips, flipComboTier } from '../public/game/src/flip-combo.mjs';

test('only resolved multi-flips have a callout and four or more use the Godlike tier', () => {
  assert.equal(flipComboTier(0), null);
  assert.equal(flipComboTier(1), null);
  assert.deepEqual([2, 3, 4, 5, 6].map(count => flipComboTier(count).line),
    ['Wooow!', 'Naaaice!', 'GODLIKE!', 'GODLIKE!', 'GODLIKE!']);
  assert.equal(flipComboTier(5).label, '5× FLIP');
});

test('each capture animates and announces the combo only on the first impact', async () => {
  const flips = ['1,0', '0,1', '-1,1', '-1,0'];
  const board = Object.fromEntries(flips.map((cell, index) => [cell, { uid: 'card-' + index }]));
  const calls = [];
  const view = {
    flip(uid, side, options) {
      calls.push(['flip', uid, side, options?.delay, options?.accent]);
      options?.onImpact();
      return Promise.resolve(true);
    },
  };
  const effect = {
    announce: (tier, cells, side) => calls.push(['announce', tier.id, cells, side]),
    flash: (tier, cell) => calls.push(['flash', tier.id, cell]),
  };
  await animateResolvedFlips(view, { board, last: { flips: flips.slice(0, 1), side: 0 } }, effect);
  assert.deepEqual(calls, [['flip', 'card-0', 0, undefined, undefined]]);

  calls.length = 0;
  await animateResolvedFlips(view, { board, last: { flips, side: 1 } }, effect);
  assert.deepEqual(calls.filter(call => call[0] === 'announce'), [['announce', 'quad', flips, 1]]);
  assert.deepEqual(calls.filter(call => call[0] === 'flash').map(call => call[2]), flips);
  assert.deepEqual(calls.filter(call => call[0] === 'flip').map(call => call.slice(2)),
    [[1, 0, true], [1, 65, true], [1, 130, true], [1, 195, true]]);
});
