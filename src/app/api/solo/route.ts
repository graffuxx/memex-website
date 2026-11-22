import {createGameHandler} from '../../../../server/game/handler50.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return createGameHandler({env:(name:string)=>process.env[name]??({SUPABASE_URL:'https://vnwvwwukqlbwzqroaqeu.supabase.co',SUPABASE_ANON_KEY:'sb_publishable_Nz664DzwUuBcOpLzCXgB_Q_4SzenMlV'} as Record<string,string>)[name]})(request);}
