import {EXPANSION_CARDS} from './expansion27.mjs';
// A set mark lives on visible faces and packaging. Never on actual card backs.
export const ALPHA_IDS=Object.freeze(['pepe','doge','roll-safe',...EXPANSION_CARDS.map(c=>c.id)]);
export const UNIVERSAL_CARD_BACK='/game/assets/cards/frame-v21/memex-back.webp';
export const ALPHA_MARK=Object.freeze({x:.405,titleOffset:.004,glyphY:-.009});
const symbol=`<path d="M0 -.058L.05 -.029V.029L0 .058L-.05 .029V-.029Z" fill="#e0b754" stroke="#70501f" stroke-width=".006"/><text x="0" y="${ALPHA_MARK.glyphY}" font-family="Georgia,serif" font-style="italic" font-size=".088" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#35230e">α</text>`;
export function alphaNameplateMarkup(titleY){return `<g aria-label="Alpha edition" transform="translate(${ALPHA_MARK.x} ${-titleY+ALPHA_MARK.titleOffset})">${symbol}</g>`;}
export function alphaSymbolSvg(){return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-.06 -.06 .12 .12">${symbol}</svg>`;}
