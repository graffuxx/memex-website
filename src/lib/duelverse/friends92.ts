import {supabase} from '@/lib/supabaseClient';
import {DEFAULT_IDENTITY85} from '../../../public/game/platform/identity85.mjs';
import type {PlayerIdentity85} from './account';
import {FRIEND_SIGNALS} from '../../../public/game/platform/friend-signals.mjs';
export type Friend92={id:string;identity:PlayerIdentity85;relationship:'friend'|'incoming'|'outgoing'|'none';presence?:'online'|'away'|'offline'|'unknown'};
export type DuelInvite92={id:string;direction:'incoming'|'outgoing';identity:PlayerIdentity85;status:'waiting'|'matched';createdAt:string};
export type SignalKind=keyof typeof FRIEND_SIGNALS;
export type FriendSignal={id:string;signal:SignalKind;createdAt:string;identity:PlayerIdentity85};
export type Social92={people:Friend92[];blocked:Friend92[];invites:DuelInvite92[];signals:FriendSignal[]};
const known=/^(Sign in with a verified email address|Enter the exact player name|Choose another player|Player unavailable|Choose your permanent player name first|Wait before sending|Daily friend request limit reached|Friend list is full|No incoming friend request|Request unavailable|Accept the friend request first|Finish or leave your current duel first|Cancel your existing invitation|Invitation expired or unavailable|Invitation unavailable|Choose a saved 15-card deck|Saved deck contains unavailable copies|A match was found|Choose a valid friend signal|Signals are only available between friends)/;
async function rpc92(name:string,args:Record<string,unknown>={}){const {data,error}=await supabase.rpc(name,args);if(error)throw Error(known.test(error.message)?error.message:'The action could not be confirmed. Refresh and try again.');return data;}
const identity92=(value:Partial<PlayerIdentity85>)=>({...DEFAULT_IDENTITY85,...value,nameClaimed:true,owned:[],wins:value?.wins??0}) as PlayerIdentity85;
function readSocial114(data:Social92):Social92{return {people:(data.people??[]).map((p:Friend92)=>({...p,identity:identity92(p.identity)})),blocked:(data.blocked??[]).map((p:Friend92)=>({...p,identity:identity92(p.identity)})),invites:(data.invites??[]).map((p:DuelInvite92)=>({...p,identity:identity92(p.identity)})),signals:(data.signals??[]).filter(p=>Object.hasOwn(FRIEND_SIGNALS,p.signal)).map(p=>({...p,identity:identity92(p.identity)}))};}
export async function socialList114():Promise<Social92>{return readSocial114(await rpc92('dv_social_list114'));}
export async function socialSearch92(name:string):Promise<Friend92|null>{const p=await rpc92('dv_social_search92',{p_name:name});return p?{...p,identity:identity92(p.identity)}:null;}
export async function socialAction92(id:string,action:string){await rpc92('dv_social_action92',{p_other:id,p_action:action});window.dispatchEvent(new Event('duelverse-social92'));}
export async function friendInvite92(friendId:string,deckId:string):Promise<{id:string;friendName:string}>{return rpc92('dv_friend_invite92',{p_friend:friendId,p_deck:deckId});}
export async function friendReply92(matchId:string,action:'accept'|'decline',deckId:string|null):Promise<string|null>{const id=await rpc92('dv_friend_reply92',{p_match:matchId,p_action:action,p_deck:deckId});window.dispatchEvent(new Event('duelverse-social92'));return id;}

export async function sendFriendSignal(friendId:string,signal:SignalKind){await rpc92('dv_send_friend_signal',{p_friend:friendId,p_signal:signal});}
