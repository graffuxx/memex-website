'use client';

import {useEffect, useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {loadPlayer} from '@/lib/duelverse/account';
import {starterDeck, starterInventory, validateDeck} from '../../../public/game/platform/catalog.mjs';
import styles from './PlayArena.module.css';

const PLAY_KEY = 'duelverse.play-deck.v1';
const ARENA_URL = '/game/table-demo.html';

export default function RewardedDuelLauncher() {
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    async function prepare() {
      let cards = starterDeck(), inventory = starterInventory(), name = 'Starter deck', source = 'guest';
      let warning = '', deckId: string | null = null;
      try {
        const {data: {session}, error} = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          const player = await loadPlayer();
          if (!alive) return;
          const deck = player.decks.find(d => d.active) ?? player.decks[0];
          if (!deck || !validateDeck(deck.cards, player.inventory).valid) throw Error('Saved deck unavailable');
          deckId = deck.id; cards = deck.cards; inventory = player.inventory; name = deck.name; source = 'account';
        } else {
          const draft = JSON.parse(localStorage.getItem('duelverse.guest-deck.v1') ?? 'null');
          if (draft?.version === 1 && validateDeck(draft.cards, inventory).valid) {
            cards = draft.cards;
            name = typeof draft.name === 'string' ? draft.name.slice(0, 40) : 'Guest deck';
          }
        }
      } catch {
        warning = 'Your saved deck could not be loaded. Check your deck, or continue with the starter preview.';
      }
      if (!alive) return;
      try {
        localStorage.setItem(PLAY_KEY, JSON.stringify({version: 1, cards, inventory, name, source, deckId}));
      } catch {
        // A full storage area must not leave an older selected deck in use.
        try { localStorage.removeItem(PLAY_KEY); } catch {}
        warning = 'Browser storage is unavailable. You can continue with the starter preview.';
      }
      if (warning) {
        setNotice(warning);
        return;
      }
      // Navigate the top-level page after preparing the deck. No iframe or outer page scroll.
      window.location.replace(ARENA_URL);
    }
    void prepare();
    return () => { alive = false; };
  }, []);

  return <section className={styles.launch} aria-label="Preparing your duel">
    <img src="/memex-mainlogo.png" alt="MemeX Duelverse" />
    <h1>{notice ? 'Before your duel' : 'Loading your duel…'}</h1>
    <p role="status">{notice || 'Preparing your selected 15-card deck.'}</p>
    {notice && <nav aria-label="Deck loading options">
      <a href={ARENA_URL}>Play starter preview</a>
      <a href="/decks">Check my deck</a>
      <a href="/">Back to website</a>
    </nav>}
  </section>;
}
