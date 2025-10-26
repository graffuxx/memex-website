import Hero from '@/components/Hero'
import PresaleOverview from '@/components/PresaleOverview'
import CardPreview from '@/components/CardPreview'
import MissionSection from '@/components/MissionSection'
import NFTStakingSoon from '@/components/NFTStakingSoon'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <PresaleOverview />
      <CardPreview />
      <MissionSection />
      <NFTStakingSoon />
    </div>
  )
}