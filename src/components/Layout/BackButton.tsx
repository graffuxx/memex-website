'use client';
import {canReturnWithinSite} from '../../../public/game/platform/navigation61.mjs';
import styles from './BackButton.module.css';
export default function BackButton({fallback='/',className=''}:{fallback?:string;className?:string}){
 return <button type="button" className={`${styles.button} ${className}`} aria-label="Go back" title="Back to the previous page" onClick={()=>{
  if(canReturnWithinSite({historyLength:window.history.length,referrer:document.referrer,currentUrl:window.location.href}))window.history.back();
  else window.location.assign(fallback);
 }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" strokeLinecap="round" strokeLinejoin="round"/></svg><span>Back</span></button>;
}
