export const NAV_LINKS=[['/','HOME'],['/play','PLAY'],['/how-to-play','HOW TO PLAY'],['/collection','COLLECTION'],['/decks','DECKS'],['/shop','SHOP'],['/news','NEWS'],['/socials','SOCIALS']] as const;
export function activeNav(path:string,url:string){
 if(url==='/shop')return path==='/boosters'||path.startsWith('/boosters/')||path==='/shop'||path.startsWith('/shop/');
 if(url==='/account/private')return path==='/account'||path.startsWith('/account/')||path==='/register';
 if(url==='/collection')return path==='/card-preview'||path==='/collection'||path.startsWith('/collection/');
 return url==='/'?path==='/':path===url||path.startsWith(url+'/');
}
