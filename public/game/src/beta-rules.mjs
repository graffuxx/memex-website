import {DIRECTIONS,neighbors,freeCells,sideValue,cardOf} from './rules.mjs?v=hand-effects-46';
import {isSRank126} from '../platform/card-ranks126.mjs';

const numeric=value=>!isSRank126(value);
const active=(card,game)=>card?.beta&&!card.betaDisabled&&!(game.placements<card.jammedUntil)?card.beta:null;
const enemyAround=(game,cell,side)=>neighbors(cell).filter(({id})=>game.board[id]&&game.board[id].controller!==side);
const tuning=(game,key,reference)=>game.betaTuning?.[key]??reference;
const localEdge=(card,dir)=>(dir-(card.rotation??0)+6)%6;
const patch=(card,dir,value)=>({...card,betaEdges:{...card.betaEdges,[localEdge(card,dir)]:value}});
const move=(cell,direction)=>{
  const [q,r]=cell.split(',').map(Number);
  const [dq,dr]=DIRECTIONS[direction];
  return (q+dq)+','+(r+dr);
};

export function betaAdjustment(game,card,cell,dir,base,attack) {
  if(!game.betaTrial||!numeric(base))return 0;
  const key=active(card,game);
  if(!attack)return key==='highground'&&neighbors(cell).length<6?tuning(game,'highground',2):0;
  let amount=0;
  if(key==='cinema'&&card.betaAttack?.includes(dir))amount+=tuning(game,'cinema',2);
  if(key==='spicy'&&enemyAround(game,cell,card.controller).length===2)amount+=tuning(game,'spicy',1);
  if(key==='hamster') {
    const lastMove=game.last?.type==='place'?game.last:game.history.findLast(item=>item.type==='place');
    const target=move(cell,dir);
    if(lastMove&&lastMove.side!==card.controller&&lastMove.flips.includes(target)&&game.board[target]?.controller===lastMove.side)amount+=tuning(game,'hamster',3);
  }
  if(neighbors(cell).some(({id})=>game.board[id]?.controller===1-card.controller&&active(game.board[id],game)==='tpose'))amount-=tuning(game,'tpose',2);
  return amount;
}

export function stageBetaChoice(game,card,action) {
  const choice=action.betaChoice;
  if(!choice)return;
  const key=active(card,game);
  if(key==='cinema') {
    const directions=choice.directions;
    const held=game.players[game.turn].hand.some(c=>c.uid===choice.discard&&c.uid!==card.uid);
    if(!held||!Array.isArray(directions)||directions.length<1||directions.length>2||
      new Set(directions).size!==directions.length||directions.some(dir=>!enemyAround(game,action.cell,game.turn).some(n=>n.dir===dir)||!numeric(sideValue(card,dir))))throw Error('Ungültiger Final Cut.');
    card.betaAttack=directions;
  } else if(key==='hackerman') {
    const target=game.board[choice.target],dir=choice.direction;
    if(!target||!neighbors(action.cell).some(n=>n.id===choice.target)||!Number.isInteger(dir)||dir<0||dir>5||!numeric(sideValue(target,dir)))throw Error('Ungültige Override-Kante.');
    game.board[choice.target]=patch(target,dir,tuning(game,'hackerman',4));
  } else if(key==='over9000') {
    const dir=choice.direction;
    const ally=neighbors(action.cell).some(n=>game.board[n.id]?.controller===game.turn);
    if(!ally||!Number.isInteger(dir)||dir<0||dir>5||!numeric(sideValue(card,dir)))throw Error('Ungültige Aufladung.');
    Object.assign(card,patch(card,dir,Math.min(8,sideValue(card,dir)+2)));
  } else if(key!=='parkour'&&key!=='continued'){
    throw Error('Dieser Beta-Effekt ist hier nicht verfügbar.');
  }
}

function hit(game,card,cell,dir,target,penalty,strength,canWin) {
  const enemy=game.board[target];
  if(!enemy||enemy.controller===card.controller)return null;
  const power=strength(game,card,cell,dir,enemy,{attacking:true});
  const defend=strength(game,enemy,target,(dir+3)%6,card);
  if(power.rank==='S'||defend.rank==='S')return null;
  const attack={...power,total:Math.max(1,power.total-penalty)};
  if(!canWin(attack,defend,game.elementRules))return null;
  return {cell:target,dir,attack,defend,flip:true,setup:false,pursuit:true,name:cardOf(enemy).name};
}

export function betaParkour(game,card,action,comparisons,strength,canWin) {
  const choice=action.betaChoice;
  if(active(card,game)!=='parkour'||!choice)return;
  const dir=choice.direction;
  if(!Number.isInteger(dir)||dir<0||dir>5)throw Error('Ungültige Sprungrichtung.');
  const through=move(action.cell,dir);
  const target=move(through,dir);
  const jumpable=freeCells(game).includes(through)||game.board[through]?.controller===game.turn;
  const follow=jumpable&&hit(game,card,action.cell,dir,target,tuning(game,'parkour',1),strength,canWin);
  if(!follow)throw Error('Kein möglicher Weitsprung.');
  comparisons.push(follow);
}

export function betaCliffhanger(game,card,action,comparisons,strength,canWin) {
  const choice=action.betaChoice;
  if(active(card,game)!=='continued'||!choice)return null;
  const {landing,target}=choice;
  if(!comparisons.some(c=>c.flip&&!c.redirect)||!neighbors(action.cell).some(n=>n.id===landing)||!freeCells(game).includes(landing))throw Error('Kein freies Feld für Cliffhanger.');
  if(!target)throw Error('Kein möglicher Zusatzflip.');
  {
    const edge=neighbors(landing).find(n=>n.id===target);
    const resolved=comparisons.some(c=>c.cell===target&&(c.flip||c.bailout||c.objection||c.finalGuard||c.redirect)||c.redirect===target);
    const follow=edge&&!resolved&&hit(game,card,landing,edge.dir,target,0,strength,canWin);
    if(!follow)throw Error('Kein möglicher Zusatzflip.');
    comparisons.push(follow);
  }
  return landing;
}

export function finishBetaMove(game,next,action,plan) {
  if(!game.betaTrial)return;
  const placed=next.board[action.cell],side=game.turn;
  const key=active(placed,game);
  delete placed.betaAttack;
  if(key==='cinema'&&action.betaChoice) {
    const player=next.players[side];
    const discarded=player.hand.find(c=>c.uid===action.betaChoice.discard);
    player.hand=player.hand.filter(c=>c.uid!==discarded.uid);
    player.deck.push(discarded);
  }
  if(plan.betaLanding){
    next.board[plan.betaLanding]=placed;
    delete next.board[action.cell];
  }
  for(const cell of plan.flips) {
    const old=plan.board[cell],captured=next.board[cell];
    if(active(old,game)!=='headout'||old.headoutSpent||old.controller===side)continue;
    const open=neighbors(cell).filter(({id,dir})=>id!==next.block&&!next.board[id]&&numeric(sideValue(old,dir)));
    const [edge]=open.sort((a,b)=>sideValue(old,b.dir)-sideValue(old,a.dir));
    next.board[cell]=edge?{...patch(captured,edge.dir,Math.max(1,sideValue(old,edge.dir)-tuning(game,'headout',2))),headoutSpent:true}:{...captured,headoutSpent:true};
  }

}

export function betaOptions(game,card,base,preview) {
  const key=active(card,game),cell=base.cell;
  if(!['cinema','hackerman','parkour','continued','over9000'].includes(key))return [base];
  const original=preview(game,base);
  const free=freeCells(game);
  let choices=[];
  if(key==='cinema'){
    const spare=game.players[game.turn].hand.filter(c=>c.uid!==card.uid);
    const use=spare.sort((a,b)=>quality(a)-quality(b))[0];
    const vulnerable=original.comparisons.filter(h=>!h.flip&&h.attack.rank!=='S'&&h.defend.rank!=='S'&&h.defend.total-h.attack.total<=tuning(game,'cinema',2)).slice(0,2);
    if(use&&vulnerable.length)choices=[{discard:use.uid,directions:vulnerable.map(h=>h.dir)}];
  } else if(key==='hackerman'){
    for(const {id:target,dir} of neighbors(cell)){
      const other=game.board[target];
      if(!other)continue;
      for(const n of neighbors(target)){
        if(n.id!==cell&&(!free.includes(n.id)||other.controller!==game.turn&&sideValue(other,n.dir)<tuning(game,'hackerman',4)))continue;
        if(n.id===cell&&(other.controller===game.turn||n.dir!==(dir+3)%6||sideValue(other,n.dir)<=tuning(game,'hackerman',4)))continue;
        const value=sideValue(other,n.dir);
        if(numeric(value)&&value!==tuning(game,'hackerman',4))choices.push({target,direction:n.dir});
      }
    }
  } else if(key==='parkour'){
    choices=[0,1,2,3,4,5].flatMap(direction=>{
      const through=move(cell,direction);
      const canJump=free.includes(through)||game.board[through]?.controller===game.turn;
      const enemy=game.board[move(through,direction)];
      return canJump&&enemy?.controller===1-game.turn?[{direction}]:[];
    });
  } else if(key==='over9000'){
    if(neighbors(cell).some(({id})=>game.board[id]?.controller===game.turn)){
      choices=neighbors(cell).filter(({id,dir})=>id!==game.block&&game.board[id]?.controller!==game.turn&&numeric(sideValue(card,dir))&&sideValue(card,dir)<8)
        .map(({dir:direction})=>({direction}));
    }
  } else if(original.flips.length){
    for(const {id:landing} of neighbors(cell).filter(n=>free.includes(n.id))){
      for(const {id:target} of enemyAround(game,landing,game.turn)){
        if(!original.flips.includes(target))choices.push({landing,target});
      }
    }
  }
  const valid=[];
  for(const choice of choices){
    const action={...base,betaChoice:choice};
    try{const plan=preview(game,action);if(key!=='cinema'||plan.flips.length>original.flips.length)valid.push(action);}
    catch(error){
      if(!['Kein möglicher Weitsprung.','Kein möglicher Zusatzflip.'].includes(error.message))throw error;
    }
  }
  return [base,...valid];
}

function quality(card){
  return cardOf(card).values.map(n=>isSRank126(n)?8:n).sort((a,b)=>b-a).slice(0,4).reduce((a,b)=>a+b,0)+(card.beta||cardOf(card).prime?4:0);
}
