import BrandPage from '@/components/portal/BrandPage';
import PlayerDashboard from '@/components/portal/PlayerDashboard';
export const metadata={title:'Your player area'};
export default function Page(){return <BrandPage video="/memex-accountlogin.mp4"><PlayerDashboard/></BrandPage>}
