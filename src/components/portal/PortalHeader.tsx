'use client';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
const links=[['/play','Play'],['/collection','Collection'],['/decks','Deck builder'],['/shop','Shop'],['/how-to-play','How to play']];
export default function PortalHeader(){const path=usePathname();const [open,setOpen]=useState(false);return <header className="portal-header"><a className="portal-logo" href="/" aria-label="MemeX Duelverse home"><img src="/memex-mainlogo.png" alt="MemeX Duelverse"/></a><button className="mobile-toggle" aria-expanded={open} aria-controls="portal-nav" onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button><nav id="portal-nav" className={open?'open':''} aria-label="Main navigation">{links.map(([url,label])=><a key={url} href={url} aria-current={path===url?'page':undefined} onClick={()=>setOpen(false)}>{label}</a>)}</nav><a className="portal-account" href="/account">My account</a></header>}
