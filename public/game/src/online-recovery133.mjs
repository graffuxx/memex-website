// Presentation is disposable; the authoritative match must always remain resumable.
export function createPresentationRecovery133({cancel=()=>{},timeoutMs=15000,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let valid=false;
 return {
  get needsSnapshot(){return !valid;},
  async run(paint){
   valid=false;let expired=false,timer;
   const check=()=>{if(expired)throw Error('Display interrupted. Restoring your saved duel…');};
   const deadline=new Promise((_,reject)=>{timer=setTimer(()=>{expired=true;cancel();reject(Error('Display interrupted. Restoring your saved duel…'));},timeoutMs);});
   try{await Promise.race([Promise.resolve().then(()=>paint(check)),deadline]);check();valid=true;}
   catch(error){expired=true;cancel();throw error;}
   finally{clearTimer(timer);}
  }
 };
}

export async function duelRequest133(fetcher,url,options,{timeoutMs=15000,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const controller=new AbortController();let timer;
 const deadline=new Promise((_,reject)=>{timer=setTimer(()=>{controller.abort();reject(Error('Connection interrupted. Restoring your saved duel…'));},timeoutMs);});
 try{return await Promise.race([(async()=>{const response=await fetcher(url,{...options,signal:controller.signal});const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error??'Duel unavailable.'),{status:response.status});return data;})(),deadline]);}
 finally{clearTimer(timer);}
}
