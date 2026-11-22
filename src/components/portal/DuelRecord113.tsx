'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
export default function DuelRecord113({userId}:{userId:string|null}){
 const [stats,setStats]=useState<{owner:string;wins:number;losses:number;forfeits:number}|null>(null);
 useEffect(()=>{let live=true;setStats(null);if(!userId)return;void supabase.rpc('dv_duel_stats113').then(({data,error})=>{if(live&&!error&&data)setStats({owner:userId,...data});});return()=>{live=false;};},[userId]);
 if(!stats||stats.owner!==userId)return null;
 return <div className="player-stat-line" aria-label="Random duel record"><span>Random duels</span><span><b>{stats.wins}</b> won</span><span><b>{stats.losses}</b> lost</span>{stats.forfeits>0&&<span><b>{stats.forfeits}</b> left early</span>}</div>;
}
