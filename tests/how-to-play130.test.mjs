import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {GUIDE_EXAMPLES130,guideExample130} from '../public/game/platform/guide-examples130.mjs';
import {DEFINITIONS,VARIANTS} from '../public/game/platform/catalog.mjs';import {previewEffect,placeEffect} from '../public/game/src/table-demo-rules.mjs';
import {elementAdvantage} from '../public/game/platform/elements53.mjs';
test('all seven guide situations use released native-element cards with unmodified printed values and real capture outcomes',()=>{
 assert.deepEqual(GUIDE_EXAMPLES130.map(e=>[e.id,e.flips.length]),[['stronger',1],['tie-win',1],['tie-hold',0],['double',2],['iconic',1],['iconic-s',0],['prime',1]]);
 for(const ex of GUIDE_EXAMPLES130){const original=structuredClone(ex.before),plan=previewEffect(ex.before,{uid:ex.before.players[0].hand[0].uid,cell:'0,0',rotation:0});assert.deepEqual(ex.before,original);assert.deepEqual(plan.flips,ex.flips);assert.deepEqual(placeEffect(ex.before,{uid:ex.before.players[0].hand[0].uid,cell:'0,0',rotation:0}),ex.after);for(const c of [ex.attacker,...ex.defenders]){assert.ok(VARIANTS.some(v=>v.id===c.variant.id));assert.equal(c.variant.element,c.definition.element);assert.deepEqual(c.definition.values,DEFINITIONS.find(d=>d.id===c.definition.id).values);}}
 const numeric=guideExample130('stronger').comparisons[0];assert.equal(numeric.attack.base,4);assert.equal(numeric.defend.base,3);assert.equal(numeric.attack.element,0);assert.equal(numeric.flip,true);
 const yes=guideExample130('tie-win').comparisons[0],no=guideExample130('tie-hold').comparisons[0];assert.equal(yes.attack.total,yes.defend.total);assert.equal(no.attack.total,no.defend.total);assert.equal(yes.flip,true);assert.equal(no.flip,false);
 const prime=guideExample130('prime');assert.equal(prime.comparisons[0].attack.rank,'S');assert.equal(prime.comparisons[0].defend.rank,'S');assert.equal(elementAdvantage(prime.attacker.definition.element,prime.defenders[0].definition.element),true);
});
test('guide links reach training/deck building, documents disabled fields and fixed elements, and every illustrated asset exists',async()=>{
 const page=await fs.readFile(new URL('../src/app/how-to-play/HowToPlayGuide130.tsx',import.meta.url),'utf8');assert.match(page,/Each card has one fixed element/);assert.match(page,/Random event fields and their changing bonuses are currently disabled/);assert.ok(!page.includes('Fields change after six'));assert.match(page,/\/play\?mode=training/);assert.match(page,/\/decks\?test=1/);
 for(const ex of GUIDE_EXAMPLES130)for(const c of [ex.attacker,...ex.defenders])await fs.access(new URL('../public'+c.variant.image.split('?')[0],import.meta.url));await fs.access(new URL('../public/game/assets/guide-v130/arena-gameplay.webp',import.meta.url));
});
