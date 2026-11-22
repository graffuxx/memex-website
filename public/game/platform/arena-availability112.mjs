export const PLAYABLE_ARENA112='voidforge';
export function lockArenaSelection112(select){
 if(!select)return PLAYABLE_ARENA112;
 for(const option of select.options){option.disabled=option.value!==PLAYABLE_ARENA112;if(option.disabled&&!option.textContent.includes('Coming soon'))option.textContent+=' · Coming soon';}
 select.value=PLAYABLE_ARENA112;return PLAYABLE_ARENA112;
}
