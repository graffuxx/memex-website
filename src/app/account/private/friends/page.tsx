import {redirect} from 'next/navigation';

export default async function Page({searchParams}:{searchParams:Promise<{tab?:string}>}){
 const {tab}=await searchParams;
 const section=tab==='duels'||tab==='requests'?tab:'friends';
 redirect('/play?friends='+section);
}
