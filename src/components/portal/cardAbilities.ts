import {portalTrialAbility} from '../../../public/game/platform/deck-bridge.mjs';
import {CURRENT_ICONIC_WAVE} from '../../../public/game/src/table-demo-rules.mjs';

const releasedAbilities = {iconicAbilities:true,iconicAbilityWave:CURRENT_ICONIC_WAVE,allPrimes:true};

export function releasedPortalAbility(ruleId:string, variantId:string) {
 return portalTrialAbility(releasedAbilities,{id:ruleId,variantId});
}
