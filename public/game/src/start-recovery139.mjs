// Session refresh is outside fetch: it needs its own deadline as well.
// A late session must never submit a stale move after this deadline has expired.
export async function sessionDeadline139(getSession,{timeoutMs=15000,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let timer;
 const deadline=new Promise((_,reject)=>{timer=setTimer(()=>reject(Error('Sign-in connection interrupted. Retrying your saved duel…')),timeoutMs);});
 try{return await Promise.race([Promise.resolve().then(getSession),deadline]);}
 finally{clearTimer(timer);}
}

export function createPollRecovery139({now=()=>Date.now()}={}){
 let failures=0,retryAt=0,message='';
 return {
  get message(){return message;},
  get ready(){return now()>=retryAt;},
  failed(error){failures++;message=error?.message||'Connection interrupted. Retrying your saved duel…';retryAt=now()+Math.min(15000,1800*2**Math.min(failures-1,4));},
  reset(){failures=0;retryAt=0;message='';}
 };
}
