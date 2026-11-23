import {DEFINITIONS} from '../platform/catalog.mjs';
export const CARD_PROFILES=Object.freeze(Object.fromEntries(DEFINITIONS.map(c=>[c.id,Object.freeze({
 id:c.id,values:c.values,prime:Boolean(c.prime),iconic:Boolean(c.iconic),artRegion:c.artRegion??null,edition:c.edition,name:c.short??c.name,ruleId:c.ruleId,element:c.element,asset:c.image.replace('/game/','../'),
 artAtlas:c.artAtlas??false,caption:c.quote,artOffsetY:c.artOffsetY??0
})])));
