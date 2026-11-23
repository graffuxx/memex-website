// Bound Auth calls without resubmitting password or email requests.
export function withAuthDeadline(fetcher,authOrigin,{timeoutMs=12000}={}){
 return async (input,init)=>{
  const url=new URL(typeof input==='object'&&'url' in input?input.url:String(input),authOrigin);
  if(url.origin!==authOrigin||!url.pathname.startsWith('/auth/v1/'))return fetcher(input,init);

  const controller=new AbortController();
  const signal=init?.signal??input?.signal;
  const cancel=()=>controller.abort(signal.reason);
  if(signal?.aborted)cancel();
  else signal?.addEventListener('abort',cancel,{once:true});
  const timer=setTimeout(()=>controller.abort(new Error('Account service request timed out')),timeoutMs);
  try{
   return await fetcher(input,{...init,signal:controller.signal});
  }finally{
   clearTimeout(timer);
   signal?.removeEventListener('abort',cancel);
  }
 };
}
