const marks={
 iconic:'M0 -.072 .025 -.024 .069 0 .025 .024 0 .072 -.025 .024 -.069 0 -.025 -.024Z',
 prime:'M-.082 -.035 -.046 -.018 0 -.058 .046 -.018 .082 -.035 .061 .038 -.061 .038Z',
};
export const CLASS_MARK_CENTER=.873;
export const CLASS_MARK_SIZE=.246;

function engraving(category){
 if(!Object.hasOwn(marks,category))return '';
 const sign=marks[category],detail=category==='prime'
  ?'<path d="M-.041 .017H.041" stroke="#6b4925" stroke-width=".010" stroke-linecap="round"/>'
  :'<path d="M0 -.038 .035 0 0 .038 -.035 0Z" fill="#916a33"/>';
 return `<path d="M-.111 -.068H.111L.084 .061 0 .092 -.084 .061Z" fill="#070c18" stroke="#354454" stroke-width=".011"/>
  <path d="${sign}" fill="#180f10" stroke="#060a14" stroke-width=".028" stroke-linejoin="round"/>
  <path d="${sign}" transform="translate(0 .005)" fill="none" stroke="#6d4e29" stroke-width=".022" stroke-linejoin="round"/>
  <path d="${sign}" fill="#deb572" stroke="#f3d599" stroke-width=".009" stroke-linejoin="round"/>${detail}`;
}
export function cardClassMarkMarkup(category){
 const mark=engraving(category);
 return mark?`<g data-card-class="${category}" transform="translate(0 ${CLASS_MARK_CENTER})" aria-hidden="true">${mark}</g>`:'';
}
export function classMarkTextureSvg(category){
 const mark=engraving(category),r=CLASS_MARK_SIZE/2;
 return mark?`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="${-r} ${-r} ${CLASS_MARK_SIZE} ${CLASS_MARK_SIZE}">${mark}</svg>`:'';
}
