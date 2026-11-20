import type {PlayerState} from '@/lib/duelverse/account';
import './player-balances82.css';
type Props={ready:boolean;userId:string|null;player:PlayerState|null};
export default function PlayerBalances({ready,userId,player}:Props){return <div className="alpha-wallet" aria-label="Your currencies" aria-live="polite">{!ready?<span role="status">Loading balances…</span>:player?<>{(['pixels','shards','echoes'] as const).map(currency=>{
 const content=<><i aria-hidden="true"/><span><strong>{player[currency].toLocaleString('en-US')}</strong><small>{currency[0].toUpperCase()+currency.slice(1)}</small></span></>;
 return currency==='shards'?<a className="alpha-wallet-balance alpha-wallet-shards alpha-wallet-buy82" href="/shop?category=shards" title="Buy Shards" aria-label={`Buy Shards · Current balance: ${player.shards.toLocaleString('en-US')} Shards`} key={currency}>{content}</a>:<div className={'alpha-wallet-balance alpha-wallet-'+currency} key={currency}>{content}</div>;
 })}</>:userId?<span role="status">Balances unavailable</span>:<a className="button glass" href="/account">Sign in</a>}</div>}
