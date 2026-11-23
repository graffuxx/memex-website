import type {ReactNode} from 'react';
import Footer from '@/components/Footer';
import {PlayerCollectionProvider} from './usePlayerCollection';
import PlayerArea from './PlayerArea';
export default function BrandPage({children,video='/memex-nftshop.mp4',authEntry=false}:{children:ReactNode;video?:string;authEntry?:boolean}){
 return <div className="dv-portal">
  <video className="original-page-video" autoPlay muted loop playsInline aria-hidden="true"><source src={video} type="video/mp4"/></video>
  <div className="original-page-overlay"/>
  <div className="original-page-content">
   {authEntry?children:<PlayerCollectionProvider><PlayerArea>{children}</PlayerArea></PlayerCollectionProvider>}
   <Footer/>
  </div>
 </div>;
}
