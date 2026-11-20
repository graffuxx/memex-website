export const INVENTORY_PAGE_SIZE=500;
/** Load the entire owned collection, beyond the database's default row cap.
 * @param {(cursor:string|null,size:number)=>Promise<Array<{variant_id:string,quantity:number}>>} fetchPage
 */
export async function loadAllInventory(fetchPage){
 /** @type {Record<string,number>} */ const inventory={};
 /** @type {string|null} */ let cursor=null;
 for(let page=0;page<200;page++){
  const rows=await fetchPage(cursor,INVENTORY_PAGE_SIZE);
  if(!Array.isArray(rows)||rows.length>INVENTORY_PAGE_SIZE)throw Error('Invalid collection page.');
  for(const row of rows){
   if(typeof row.variant_id!=='string'||!row.variant_id||Object.hasOwn(inventory,row.variant_id)||!Number.isInteger(row.quantity)||row.quantity<0)throw Error('Invalid collection page.');
   cursor=row.variant_id;inventory[row.variant_id]=row.quantity;
  }
  if(rows.length<INVENTORY_PAGE_SIZE)return inventory;
 }
 throw Error('Collection could not be loaded completely.');
}
