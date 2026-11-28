import {stickerSceneLayers} from '../../../public/game/platform/duel-stickers.mjs';
import '../../../public/game/sticker-scenes.css';

export type StickerArtData = {
  image:string;
  motion?:string|null;
  prop?:string;
  parts?:ReadonlyArray<{part:string;image?:string}>;
};

export default function StickerArt({art,animate=false}:{art:StickerArtData;animate?:boolean}){
  if(!art.motion)return <img src={art.image} alt="" loading="lazy"/>;
  return <span className="sticker-scene" data-motion={art.motion} data-play={animate?'':undefined}>
    {stickerSceneLayers(art).map(({part,image})=>{
      if(!image)return <span key={part} className={'sticker-'+part} aria-hidden="true"/>;
      if(part==='character'&&art.motion==='loot-goblin')return <span key={part} className="sticker-pocket">
        <img className="sticker-character" src={image} alt="" loading="lazy"/>
      </span>;
      return <img key={part} className={'sticker-'+part} src={image} alt="" loading="lazy"/>;
    })}
  </span>;
}
