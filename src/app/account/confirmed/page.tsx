import BrandPage from '@/components/portal/BrandPage';
import AuthForm from '@/components/portal/AuthForm';
export const metadata={title:'Email confirmation'};
export default function Page(){return <BrandPage authEntry video="/memex-accountlogin.mp4"><AuthForm mode="login" confirmation/></BrandPage>}
