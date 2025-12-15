'use client';

import HeroSection from '@/components/HeroSection';
import MissionSection from '@/components/MissionSection';
import PresaleOverview from '@/components/PresaleOverview';
import CardPreview from '@/components/CardPreview';
import ComingSoon from '@/components/ComingSoon';
import SocialsSection from '@/components/SocialsSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <PresaleOverview />
      <CardPreview />
      <ComingSoon />
      <SocialsSection />
      <Footer />
    </>
  );
}