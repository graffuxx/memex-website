import {createPaymentHandler81} from '../../../../server/payments/handler81.mjs';
export const payments81=()=>createPaymentHandler81({env:(name:string)=>process.env[name]});
