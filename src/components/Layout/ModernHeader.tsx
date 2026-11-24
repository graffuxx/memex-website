'use client';

import React, { useState, useEffect } from 'react';
import styles from './ModernHeader.module.css';
import MobileMenu from './MobileMenu';
import {usePathname} from 'next/navigation';
import {NAV_LINKS,activeNav} from './navigation';
import {supabase} from '@/lib/supabaseClient';

export default function ModernHeader() {
  const [scrolled, setScrolled] = useState(false);
  const path=usePathname(),[signedIn,setSignedIn]=useState(false);
  const playing=activeNav(path,'/play');
  const accountHref=signedIn?'/account/private':'/account';
  const accountLabel=signedIn?'MY ACCOUNT':'LOGIN';
  const accountActive=activeNav(path,'/account/private');
  const current=NAV_LINKS.find(([url])=>activeNav(path,url));
  useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSignedIn(Boolean(session)));return()=>subscription.unsubscribe();},[]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={styles.header}>
      <MobileMenu accountHref={accountHref} accountLabel={accountLabel}/>
      <div className={styles.mobileRow}>
        <div className={styles.mobileLocation}>
          <a href="/" className={styles.logoLink} aria-label="Home">
            <img src="/background-card.png" alt=""/>
          </a>
          <span>{accountActive?accountLabel:current?.[1]??'MEMEX'}</span>
        </div>
        {!playing&&<a className={styles.playCta} href="/play">Play</a>}
      </div>

      <div className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
        <div className={styles.container}>
          <a href="/" className={styles.logoLink}>
            <img
              src="/background-card.png"
              alt="MemeX Duelverse"
              className={styles.logoImage}
            />
          </a>

          <nav className={styles.navbar} aria-label="Main navigation">
            {NAV_LINKS.map(([url,label])=>{
              const active=activeNav(path,url);
              const style=url==='/play'
                ? styles.playCta
                : [styles.navItem,active?styles.navItemActive:'',url==='/socials'?styles.secondaryNav:''].filter(Boolean).join(' ');
              return <a key={url} href={url} className={style} aria-current={active?'page':undefined}>{label}</a>;
            })}
          </nav>

          <div className={styles.rightGroup}>
            <a href={accountHref} className={signedIn ? `${styles.loginButton} ${styles.accountButton}` : styles.loginButton} aria-current={accountActive?'page':undefined}>
              {accountLabel}
            </a>

          </div>
        </div>
      </div>
    </header>
  );
}
