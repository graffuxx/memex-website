// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import {bindPasswordRecovery106} from '../../public/game/platform/auth-recovery106.mjs';
import {withAuthDeadline} from '../../public/game/platform/auth-fetch.mjs';

const liveSupabaseUrl = 'https://vnwvwwukqlbwzqroaqeu.supabase.co';
const liveSupabaseKey = 'sb_publishable_Nz664DzwUuBcOpLzCXgB_Q_4SzenMlV';

const sandboxUrl=process.env.NEXT_PUBLIC_SUPPORTER_SANDBOX_DB_URL;
const sandboxKey=process.env.NEXT_PUBLIC_SUPPORTER_SANDBOX_PUBLISHABLE_KEY;
const useSandbox=Boolean(sandboxUrl&&sandboxKey&&sandboxUrl!==liveSupabaseUrl);
const supabaseUrl=useSandbox?sandboxUrl!:liveSupabaseUrl;
const supabaseKey=useSandbox?sandboxKey!:liveSupabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey,{
 global:{fetch:withAuthDeadline((input:RequestInfo|URL,init?:RequestInit)=>fetch(input,init),supabaseUrl)}
});
function recoveryStorage106(){try{return typeof window==='undefined'?null:window.sessionStorage;}catch{return null;}}
export const passwordRecovery106=typeof window==='undefined'?null:bindPasswordRecovery106(supabase.auth,{storage:recoveryStorage106()});
