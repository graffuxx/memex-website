import {supabase} from '@/lib/supabaseClient';
import {boosterHistoryFilter} from '../../../public/game/platform/player-area49.mjs';
import {loadAllInventory} from '../../../public/game/platform/inventory54.mjs';
export type SavedDeck={id:string;name:string;cards:string[];active:boolean};
export type PlayerState={displayName:string;inventory:Record<string,number>;decks:SavedDeck[];pixels:number;shards:number;echoes:number};
export async function loadPlayer():Promise<PlayerState>{
 const {error:initError}=await supabase.rpc('dv_initialize_account');
 if(initError)throw new Error('Cloud collection is not available yet. Your login remains valid; please use the guest preview for now.');
 const [profile,inventory,decks,wallet]=await Promise.all([
  supabase.from('dv_profiles').select('display_name').single(),
  loadAllInventory(async(cursor,size)=>{let query=supabase.from('dv_inventory').select('variant_id,quantity').order('variant_id').limit(size);if(cursor!==null)query=query.gt('variant_id',cursor);const {data,error}=await query;if(error)throw new Error('Your complete collection could not be loaded. Please try again.');return data??[];}),
  supabase.from('dv_decks').select('id,name,cards,active').order('created_at'),
  supabase.from('dv_wallets').select('earned,premium,echoes').single()
 ]);
 if([profile,decks,wallet].some(r=>r.error))throw new Error('Your collection could not be loaded. Please try again.');
 return {displayName:profile.data?.display_name??'Player',inventory,decks:(decks.data??[]) as SavedDeck[],pixels:wallet.data?.earned??0,shards:wallet.data?.premium??0,echoes:wallet.data?.echoes??0};
}
export async function saveDeck(id:string|null,name:string,cards:string[]){
 const {data,error}=await supabase.rpc('dv_save_deck',{p_id:id,p_name:name,p_cards:cards});
 if(error)throw new Error('Deck could not be saved. Check your connection and owned copies, then try again.');
 return data as string;
}
export async function tradeCard(requestId:string,kind:'craft'|'dismantle',variantId:string){
 const {error}=await supabase.rpc('dv_trade_card',{p_request:requestId,p_kind:kind,p_variant:variantId});
 if(error){
  const known=['Not enough Echoes','No spare copy: starter cards and saved decks are protected','Diamond and Void are booster exclusive','Collection limit reached'];
  throw new Error(known.includes(error.message)?error.message:'Card action could not be confirmed. Retry the same action to check it safely.');
 }
}

export type BoosterCurrency='pixels'|'shards';
export type BoosterPurchase={id:string;request_id:string;product_id:string;currency:BoosterCurrency|'starter';cost:number;cards:string[];new_variants:string[];revealed_slots:number[];created_at:string};
const boosterFields='id,request_id,product_id,currency,cost,cards,new_variants,revealed_slots,created_at';
export async function loadBoosterHistory({limit=20,before=null}:{limit?:number;before?:{id:string;created_at:string}|null}={}):Promise<BoosterPurchase[]>{
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('Invalid history page size.');
 let query=supabase.from('dv_booster_purchases36').select(boosterFields).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(limit);
 if(before)query=query.or(boosterHistoryFilter(before));
 const {data,error}=await query;
 if(error)throw Error('Your booster history could not be loaded. Please try again.');return (data??[]) as BoosterPurchase[];
}
export async function loadWelcomeBoosters():Promise<BoosterPurchase[]>{
 const {data,error}=await supabase.from('dv_booster_purchases36').select(boosterFields).eq('currency','starter').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(10);
 if(error)throw Error('Your welcome boosters could not be loaded. Please retry.');return (data??[]) as BoosterPurchase[];
}
export async function loadBooster(id:string):Promise<BoosterPurchase>{
 const {data,error}=await supabase.from('dv_booster_purchases36').select(boosterFields).eq('id',id).single();
 if(error||!data)throw Error('Your booster could not be loaded. Retry to restore the same purchase.');return data as BoosterPurchase;
}
export async function findBoosterRequest(requestId:string):Promise<BoosterPurchase|null>{
 const {data,error}=await supabase.from('dv_booster_purchases36').select(boosterFields).eq('request_id',requestId).maybeSingle();
 if(error)throw Error('Your purchase status could not be checked. Please retry.');return data as BoosterPurchase|null;
}
export class BoosterPurchaseError extends Error{constructor(message:string,public definitive=false){super(message);}}
export async function buyAlphaBooster(requestId:string,currency:BoosterCurrency):Promise<string>{
 const {data,error}=await supabase.rpc('dv_buy_alpha_booster',{p_request:requestId,p_currency:currency});
 if(error){const known=['Not enough Pixels','Not enough Shards','Collection limit reached','Invalid booster purchase','Booster catalog unavailable'];throw new BoosterPurchaseError(known.includes(error.message)?error.message:'The purchase could not be confirmed. Retry this same request to restore it safely.',known.includes(error.message));}
 if(typeof data!=='string')throw new BoosterPurchaseError('The purchase response could not be read. Retry this same request.');return data;
}
export async function revealBoosterCard(boosterId:string,slot:number):Promise<void>{
 const {error}=await supabase.rpc('dv_reveal_booster_card',{p_booster:boosterId,p_slot:slot});
 if(error)throw Error('The card reveal could not be saved. Your purchased cards are safe; please retry.');
}
