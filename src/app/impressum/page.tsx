import BrandPage from '@/components/portal/BrandPage';
import './impressum.css';

export const metadata={title:'Impressum',description:'Anbieter und Kontakt für MemeX Duelverse.'};

export default function Impressum(){return <BrandPage video="/memex-accountlogin.mp4"><section className="portal-section top-space imprint82" lang="de"><span className="imprint-eyebrow82">MemeX Duelverse</span><h1>Impressum</h1><div className="imprint-card82"><h2>Anbieter</h2><address><strong>AI.on Solutions</strong><br/>Inh. Jan Ritter<br/>Collenburger Str. 7<br/>24960 Glücksburg<br/>Deutschland</address><h2>Kontakt</h2><a href="mailto:info@memexduelverse.com">info@memexduelverse.com</a></div><a className="imprint-back82" href="/">Zur Startseite</a></section></BrandPage>}
