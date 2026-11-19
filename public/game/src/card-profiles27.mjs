import {DEFINITIONS} from '../platform/catalog.mjs';
export const CARD_PROFILES=Object.freeze(Object.fromEntries(DEFINITIONS.map(c=>[c.id,Object.freeze({
 id:c.id,name:c.short??c.name,ruleId:c.ruleId,element:c.element,asset:c.image.replace('/game/','../'),
 caption:c.quote,artOffsetY:c.artOffsetY??0
})])));
