'use client';

import React, { useState, useEffect } from 'react';
import styles from './ModernHeader.module.css';
import MobileMenu from './MobileMenu';
import BackButton from './BackButton';
import {usePathname} from 'next/navigation';
import {NAV_LINKS,activeNav} from './navigation';
import {supabase} from '@/lib/supabaseClient';

export default function ModernHeader() {
  const [scrolled, setScrolled] = useState(false);
  const path=usePathname(),[signedIn,setSignedIn]=useState(false);
  const current=NAV_LINKS.find(([url])=>activeNav(path,url));
  useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSignedIn(Boolean(session)));return()=>subscription.unsubscribe();},[]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={styles.header}>
      <MobileMenu />
      {path!=='/'&&<BackButton className={styles.mobileBack} fallback={signedIn&&path!=='/account/private'?'/account/private':'/'}/>}
      <a className={styles.mobileLocation} href={current?.[0]??'/'}><img src="/background-card.png" alt=""/>{current?.[1]??'MEMEX'}</a>

      <div className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
        <div className={styles.container}>
          <div className={styles.leftGroup}>
            {path!=='/'&&<BackButton fallback={signedIn&&path!=='/account/private'?'/account/private':'/'}/> }
            <a href="/" className={styles.logoLink}>
              <img
                src="/background-card.png"
                alt="MemeX Duelverse"
                className={styles.logoImage}
              />
            </a>
          </div>

          <nav className={styles.navbar} aria-label="Main navigation">
            {NAV_LINKS.map(([url,label])=><a key={url} href={url} className={`${styles.navItem} ${activeNav(path,url)?styles.navItemActive:''}`} aria-current={activeNav(path,url)?'page':undefined}>{label}</a>)}
          </nav>

          <div className={styles.rightGroup}>
            <a href={signedIn?'/account/private':'/account'} className={styles.loginButton}>
              {signedIn?'MY ACCOUNT':'LOGIN'}
            </a>

          </div>
        </div>
      </div>
    </header>
  );
}