import BrandPage from '@/components/portal/BrandPage';
import SupporterPacks from '@/components/portal/SupporterPacks';

export const metadata={title:'Support the Duelverse'};

export default function SupportPage(){
  const sandboxCheckout=process.env.DV_SUPPORTER_SANDBOX_ENABLED==='true';
  return <BrandPage><SupporterPacks sandboxCheckout={sandboxCheckout}/></BrandPage>;
}
