import {payments81} from '../payment-handler';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request){return payments81()(req,'orders');}
