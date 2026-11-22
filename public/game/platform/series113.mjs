export const SERIES_TARGET113=2;
export function series113(results=[]){
 const wins=[0,0];let draws=0;
 for(const score of results){if(!Array.isArray(score)||score.length!==2||!score.every(Number.isFinite))continue;if(score[0]===score[1])draws++;else wins[score[0]>score[1]?0:1]++;}
 const winner=wins[0]>=SERIES_TARGET113?0:wins[1]>=SERIES_TARGET113?1:null;
 return {wins,draws,winner,finished:winner!==null,target:SERIES_TARGET113};
}
export function seriesStarter113(first,round){return (round-1)%2===0?first:1-first;}
