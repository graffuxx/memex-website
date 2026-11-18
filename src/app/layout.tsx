import './globals.css';
import './portal.css';
import type {Metadata} from 'next';
import PortalHeader from '@/components/portal/PortalHeader';
export const metadata:Metadata={title:{default:'MemeX Duelverse · Play. Flip. Repeat.',template:'%s · MemeX Duelverse'},description:'Meme-powered hex strategy. Play the browser alpha, explore the collection and build a 15-card deck.',metadataBase:new URL('https://www.memexduelverse.com'),openGraph:{title:'MemeX Duelverse',description:'Your memes. Your deck. Your next move.',images:['/og-memex.png']},icons:{icon:'/memex-favicon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PortalHeader/><main>{children}</main><footer className="portal-footer"><a href="/">MemeX · Duelverse</a><span>Browser alpha · built for the meme community</span><a href="/how-to-play">Game rules</a></footer></body></html>}
