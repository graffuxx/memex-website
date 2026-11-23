// S is a rank, never the result of adding numeric bonuses. JSON/SQL store it as 10.
export const S_RANK126=10;
export const isSRank126=value=>value===S_RANK126||value==='S';
export const printedValue126=value=>isSRank126(value)?'S':String(value);
export function rankedStrength126(base,bonus=0){return isSRank126(base)?{base:S_RANK126,rank:'S',total:S_RANK126}:{base,total:base+bonus};}
