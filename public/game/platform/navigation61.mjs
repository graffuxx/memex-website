/** Use actual browser history only when this page was reached from another page on our site. */
export function canReturnWithinSite({historyLength,referrer,currentUrl}){
 if(!Number.isInteger(historyLength)||historyLength<2||!referrer)return false;
 try{
  const previous=new URL(referrer),current=new URL(currentUrl);
  return ['http:','https:'].includes(current.protocol)&&previous.origin===current.origin&&previous.pathname+previous.search!==current.pathname+current.search;
 }catch{return false;}
}
