import './globals.css';
import './portal.css';
import type {Metadata} from 'next';
import ModernHeader from '@/components/Layout/ModernHeader';
import LayoutWrapper from '@/components/Layout/LayoutWrapper';
import SocialBubble111 from '@/components/portal/SocialBubble111';
export const metadata:Metadata={title:{default:'MemeX Duelverse',template:'%s · MemeX Duelverse'},description:'Meme-powered hex strategy. Play the browser alpha, explore the collection and build a 15-card deck.',metadataBase:new URL('https://www.memexduelverse.com'),openGraph:{title:'MemeX Duelverse',description:'Meme-powered strategy in the Duelverse.',images:['/og-memex.png']},icons:{icon:'/memex-favicon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body style={{margin:0,padding:0}}><ModernHeader/><LayoutWrapper><main>{children}</main></LayoutWrapper><SocialBubble111/></body></html>}
