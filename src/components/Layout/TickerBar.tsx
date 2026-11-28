import Link from 'next/link';
import styles from './TickerBar.module.css';

export default function TickerBar() {
  return (
    <div className={styles.tickerWrapper}>
      <Link className={styles.tickerInner} href="/news#shop-cosmetics">
        <span className={styles.icon} aria-hidden="true">✦</span>
        <span className={styles.text}>Shop drop · New stickers. New faces.</span>
        <span className={styles.icon} aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
