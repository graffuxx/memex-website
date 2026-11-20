import {NextResponse} from 'next/server';
// Retired token-presale endpoint. Shards use authenticated, receipt-verified /api/shop routes.
export async function POST(){return NextResponse.json({error:'Presale purchases are no longer available.'},{status:410});}
