import Link from 'next/link';
import PlayArena from '@/components/portal/PlayArena';
export const metadata={title:'Play'};
export default function Play(){return <div className="play-page"><div className="play-intro"><div><span className="eyebrow">PLAYABLE ALPHA</span><h1>The board is yours.</h1><p>Play against the demo AI. Your saved 15-card deck loads before you enter the arena. No rewards or ranked results in this alpha.</p></div><Link className="button glass" href="/decks">Change deck</Link></div><PlayArena/></div>}
