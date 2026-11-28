import {createPaymentHandler81} from '../../../../../../server/payments/handler81.mjs';

export const runtime='nodejs';
export const dynamic='force-dynamic';

type Context={params:Promise<{action:string}>};

export async function GET(req:Request,{params}:Context) {
  const {action}=await params;
  if(action!=='config'&&action!=='orders')return new Response(null,{status:405});
  return createPaymentHandler81({env:(name:string)=>process.env[name],product:'supporter'})(req,action);
}

export async function POST(req:Request,{params}:Context) {
  const {action}=await params;
  if(action!=='create'&&action!=='capture'&&action!=='webhook')return new Response(null,{status:405});
  return createPaymentHandler81({env:(name:string)=>process.env[name],product:'supporter'})(req,action);
}
