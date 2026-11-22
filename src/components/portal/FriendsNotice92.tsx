'use client';
import usePlayerCollection from './usePlayerCollection';
import {useSocialInbox111} from '@/lib/duelverse/socialInbox111';
export function useFriendsCount92(userId:string|null,enabled=true){
 const inbox=useSocialInbox111();
 const items=enabled&&userId===inbox.userId?inbox.items:[];
 return {requests:items.filter(i=>i.kind==='friend').length,invites:items.filter(i=>i.kind==='duel').length};
}
export default function FriendsNotice92(){const {ready,userId}=usePlayerCollection(),count=useFriendsCount92(userId,ready);if(!userId)return null;return <div className="friends-quick92"><a href="/account/private/friends">Friends{count.requests+count.invites>0&&<b aria-label={`${count.requests+count.invites} pending requests and invitations`}>{count.requests+count.invites}</b>}</a>{count.invites>0&&<a href="/account/private/friends?tab=duels">Duel invitation waiting · Review</a>}</div>;}
