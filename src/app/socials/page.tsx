'use client';

import SocialSection from '@/components/SocialsSection';
import PageShell from '@/components/Layout/PageShell';

export default function SocialsPage() {
  return (
    <PageShell videoSrc="/socialmedia-background.mp4" overlay="soft">
      <SocialSection />
    </PageShell>
  );
}