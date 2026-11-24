'use client';

import {useState} from 'react';
import Link from 'next/link';
import {abilityIconTextureSvg} from '../../../public/game/src/card-ability-icon.mjs';
import {findGuideAbilities,glossary,guideAbilities} from './ability-reference.mjs';
import styles from './HowToPlay.module.css';

const categories=[
 {id:'regular',label:'Elements'},
 {id:'iconic',label:'Iconic'},
 {id:'prime',label:'Prime'},
 {id:'all',label:'All'},
] as const;
type Category=typeof categories[number]['id'];

function GlossaryTerms({terms}:{terms:typeof glossary}){
 return <dl className={styles.glossaryGrid}>
  {terms.map(({term,alias,text})=><div key={term}>
   <dt>{term}{alias&&<small lang="de">{alias}</small>}</dt>
   <dd>{text}</dd>
  </div>)}
 </dl>;
}

export default function AbilityReference(){
 const [category,setCategory]=useState<Category>('regular');
 const [query,setQuery]=useState('');
 const visible=findGuideAbilities(query,category);
 return <>
  <section id="glossary" className={styles.referenceSection} aria-labelledby="glossary-title">
   <header className={styles.sectionHeading}>
    <h2 id="glossary-title">Game terms</h2>
   </header>
   <GlossaryTerms terms={glossary.slice(0,3)}/>
   <details className={styles.moreTerms}>
    <summary>More terms</summary>
    <GlossaryTerms terms={glossary.slice(3)}/>
   </details>
  </section>
  <section id="abilities" className={styles.referenceSection} aria-labelledby="abilities-title">
   <header className={styles.sectionHeading}>
    <div><h2 id="abilities-title">Card <em>abilities</em></h2><p>The top hex shows the ability. Open an entry to see when it triggers and what it does.</p></div>
    <Link className="button glass" href="/play?mode=deck-test">Try abilities in Deck Test</Link>
   </header>
   <div className={styles.referencePanel}>
    <div className={styles.referenceToolbar}>
     <label className={styles.referenceSearch}>Find a card or ability
      <input type="search" placeholder="Two Buttons, Wellenschild, Blockade…" value={query} onChange={event=>{
       setQuery(event.target.value);
       if(!query.trim()&&event.target.value.trim())setCategory('all');
      }}/>
     </label>
     <div className={styles.referenceFilters} role="group" aria-label="Ability categories">
      {categories.map(({id,label})=><button type="button" key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>
       {label} <span>{id==='all'?guideAbilities.length:guideAbilities.filter(ability=>ability.category===id).length}</span>
      </button>)}
     </div>
    </div>
    <p className={styles.referenceCount} role="status">{visible.length} {visible.length===1?'ability':'abilities'}</p>
    {visible.length===0&&<p className={styles.referenceEmpty}>No matches. Try a card name or choose All.</p>}
    <div className={styles.abilityList}>
     {visible.map(({id,name,title,gameLabel,trigger,effect})=><details key={id} className={styles.abilityEntry}>
      <summary>
       <span className={styles.referenceIcon} aria-hidden="true" dangerouslySetInnerHTML={{__html:abilityIconTextureSvg(id)}}/>
       <span className={styles.abilityTitle}><strong>{name}</strong><span>{title}{gameLabel!==title&&<small lang="de">{gameLabel}</small>}</span></span>
      </summary>
      <dl className={styles.abilitySteps}>
       <div><dt>When it triggers</dt><dd>{trigger}</dd></div>
       <div><dt>What happens</dt><dd>{effect}</dd></div>
      </dl>
     </details>)}
    </div>
   </div>
   <p className={styles.referenceModes}>The abilities listed here are active in Random, Private Duels and Deck Test. Select a card and a target hex during a duel to see any available choices.</p>
  </section>
 </>;
}
