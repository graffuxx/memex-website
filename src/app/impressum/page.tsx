import BrandPage from '@/components/portal/BrandPage';
import './impressum.css';

export const metadata={title:'Impressum',description:'Anbieter und Kontakt für MemeX Duelverse.'};

export default function Impressum(){
  return <BrandPage video="/memex-accountlogin.mp4">
    <section className="portal-section top-space imprint82" lang="de" aria-labelledby="imprint-title">
      <div className="imprint-card82">
        <span className="imprint-eyebrow82">MemeX Duelverse</span>
        <h1 id="imprint-title">Impressum</h1>
        <h2>Anbieter</h2>
        <address>
          <strong>AI.on Solutions</strong><br/>
          Inh. Jan Ritter<br/>
          Collenburger Str. 7<br/>
          24960 Glücksburg<br/>
          Deutschland
        </address>
        <h2>Kontakt</h2>
        <a href="mailto:info@memexduelverse.com">info@memexduelverse.com</a>
        <div className="imprint-actions82"><a href="/">Zur Startseite</a></div>
      </div>
    </section>
  </BrandPage>;
}
