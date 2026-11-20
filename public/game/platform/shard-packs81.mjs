// Approved one-time EUR packages. Prices are always resolved again by the server/database.
export const SHARD_PACKS81=Object.freeze([
 Object.freeze({id:'shards-150',name:'Pocket Shards',shards:150,cents:199,currency:'EUR',boosters:1}),
 Object.freeze({id:'shards-800',name:'Shard Cache',shards:800,cents:999,currency:'EUR',boosters:5}),
 Object.freeze({id:'shards-1800',name:'Shard Vault',shards:1800,cents:1999,currency:'EUR',boosters:12})
]);
export const shardPack81=id=>SHARD_PACKS81.find(p=>p.id===id)??null;
export const euro81=cents=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100);
export function moneyCents81(amount){if(typeof amount!=='string'||!/^\d{1,8}\.\d{2}$/.test(amount))return null;return Number(amount.replace('.',''));}
