import {portalTrialAbility} from '../../../public/game/platform/deck-bridge.mjs';

const releasedAbilities = {iconicAbilities:true,iconicAbilityWave:7,allPrimes:true};

export function releasedPortalAbility(ruleId:string, variantId:string) {
 return portalTrialAbility(releasedAbilities,{id:ruleId,variantId});
}
