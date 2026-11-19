import {supabase} from '@/lib/supabaseClient';
export type SavedDeck={id:string;name:string;cards:string[];active:boolean};
export type PlayerState={displayName:string;inventory:Record<string,number>;decks:SavedDeck[];pixels:number;shards:number;echoes:number};
export async function loadPlayer():Promise<PlayerState>{
 const {error:initError}=await supabase.rpc('dv_initialize_account');
 if(initError)throw new Error('Cloud collection is not available yet. Your login remains valid; please use the guest preview for now.');
 const [profile,inventory,decks,wallet]=await Promise.all([
  supabase.from('dv_profiles').select('display_name').single(),
  supabase.from('dv_inventory').select('variant_id,quantity'),
  supabase.from('dv_decks').select('id,name,cards,active').order('created_at'),
  supabase.from('dv_wallets').select('earned,premium,echoes').single()
 ]);
 if([profile,inventory,decks,wallet].some(r=>r.error))throw new Error('Your collection could not be loaded. Please try again.');
 return {displayName:profile.data?.display_name??'Player',inventory:Object.fromEntries((inventory.data??[]).map(r=>[r.variant_id,r.quantity])),decks:(decks.data??[]) as SavedDeck[],pixels:wallet.data?.earned??0,shards:wallet.data?.premium??0,echoes:wallet.data?.echoes??0};
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
