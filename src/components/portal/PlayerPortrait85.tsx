import type {CSSProperties} from 'react';
import {frame85,frameSvg85,portrait85,progression85,title85} from '../../../public/game/platform/identity85.mjs';
import type {PlayerIdentity85} from '@/lib/duelverse/account';
import './identity85.css';
export default function PlayerPortrait85({identity,size=110}:{identity:PlayerIdentity85;size?:number}){
 const frame=frame85(identity),portrait=portrait85(identity.avatarId),progress=progression85(identity.xp);
 return <span className="identity-portrait85" data-tier={frame.tier} style={{'--portrait-size':size+'px','--frame-color':frame.color} as CSSProperties} aria-label={`${portrait.name} portrait, ${frame.name} frame, level ${progress.level}`}><img src={portrait.image} alt=""/><span className="identity-ring85" dangerouslySetInnerHTML={{__html:frameSvg85(frame,progress.level)}}/></span>;
}
export function PlayerSignature85({identity}:{identity:PlayerIdentity85}){return <span className="identity-signature85"><strong>{identity.displayName}</strong>{title85(identity)&&<small>{title85(identity)}</small>}</span>;}
