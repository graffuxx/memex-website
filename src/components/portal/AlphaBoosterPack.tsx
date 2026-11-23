import {ALPHA_BOOSTER} from '../../../public/game/platform/alpha-booster36.mjs';
import './alpha-pack-art.css';

export default function AlphaBoosterPack({compact=false}:{compact?:boolean}){
 return <span className={'alpha-pack-art'+(compact?' alpha-pack-art--compact':'')}><img className="alpha-pack-art__wrapper" src={ALPHA_BOOSTER.image} alt="Alpha Booster foil pack with an angular blue alpha emblem"/><img className="alpha-pack-art__logo" src="/memex-mainlogo.png" alt="MemeX Duelverse"/><span className="alpha-pack-art__name">ALPHA</span></span>;
}
