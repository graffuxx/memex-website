import {createMatchHandler90} from '../../../../server/game/match-handler90.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return createMatchHandler90({env:(name:string)=>process.env[name]})(request);}
