'use client';

import HeroSection from '@/components/HeroSection';
import MissionSection from '@/components/MissionSection';
import PresaleOverview from '@/components/PresaleOverview';
import CardPreview from '@/components/CardPreview';
import ComingSoon from '@/components/ComingSoon';
import SocialsSection from '@/components/SocialsSection';
import Footer from '@/components/Footer';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <video autoPlay muted loop playsInline className={styles.bgVideo}>
        <source src="/memex-hero.mp4" type="video/mp4" />
      </video>
      <div className={styles.bgOverlay} />

      <HeroSection />
      <MissionSection />
      <PresaleOverview />
      <CardPreview />
      <ComingSoon />
      <SocialsSection />
      <Footer />
    </div>
  );
}