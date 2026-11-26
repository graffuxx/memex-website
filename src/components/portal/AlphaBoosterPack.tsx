import {ALPHA_BOOSTER} from '../../../public/game/platform/alpha-booster36.mjs';
import './alpha-pack-art.css';

export default function AlphaBoosterPack({compact=false,beta=false}:{compact?:boolean;beta?:boolean}){
 return <span className={'alpha-pack-art'+(compact?' alpha-pack-art--compact':'')+(beta?' alpha-pack-art--beta':'')}><img className="alpha-pack-art__wrapper" src={ALPHA_BOOSTER.image} alt={beta?"Beta Preview Booster foil pack":"Alpha Booster foil pack"}/><img className="alpha-pack-art__logo" src="/memex-mainlogo.png" alt="MemeX Duelverse"/>{beta&&<span aria-hidden="true" className="beta-pack-emblem">β</span>}<span className="alpha-pack-art__name">{beta?'BETA':'ALPHA'}</span></span>;
}
