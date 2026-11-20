'use client';
import {useEffect,useState} from 'react';
import usePlayerCollection from './usePlayerCollection';
import {socialSummary92} from '@/lib/duelverse/friends92';
export function useFriendsCount92(userId:string|null,enabled=true){
 const [count,setCount]=useState({requests:0,invites:0});
 useEffect(()=>{setCount({requests:0,invites:0});if(!userId||!enabled)return;let live=true,fetching=false;async function update(){if(fetching||document.hidden)return;fetching=true;try{const next=await socialSummary92();if(live)setCount(next);}catch{}finally{fetching=false;}}void update();const timer=setInterval(update,20000);window.addEventListener('focus',update);window.addEventListener('duelverse-social92',update);return()=>{live=false;clearInterval(timer);window.removeEventListener('focus',update);window.removeEventListener('duelverse-social92',update);};},[userId,enabled]);return count;
}
export default function FriendsNotice92(){const {ready,userId}=usePlayerCollection(),count=useFriendsCount92(userId,ready);if(!userId)return null;return <div className="friends-quick92"><a href="/account/private/friends">Friends{count.requests+count.invites>0&&<b aria-label={`${count.requests+count.invites} pending requests and invitations`}>{count.requests+count.invites}</b>}</a>{count.invites>0&&<a href="/account/private/friends?tab=duels">Duel invitation waiting · Review</a>}</div>;}
