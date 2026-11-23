// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import {bindPasswordRecovery106} from '../../public/game/platform/auth-recovery106.mjs';
import {withAuthDeadline} from '../../public/game/platform/auth-fetch.mjs';

const supabaseUrl = 'https://vnwvwwukqlbwzqroaqeu.supabase.co';
const supabaseKey = 'sb_publishable_Nz664DzwUuBcOpLzCXgB_Q_4SzenMlV';

export const supabase = createClient(supabaseUrl, supabaseKey,{
 global:{fetch:withAuthDeadline((input:RequestInfo|URL,init?:RequestInit)=>fetch(input,init),supabaseUrl)}
});
function recoveryStorage106(){try{return typeof window==='undefined'?null:window.sessionStorage;}catch{return null;}}
export const passwordRecovery106=typeof window==='undefined'?null:bindPasswordRecovery106(supabase.auth,{storage:recoveryStorage106()});
