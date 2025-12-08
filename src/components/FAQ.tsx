'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

const faqData = [
  {
    question: 'When does the MemeX presale start?',
    answer:
      'The presale begins 20 days after our final site launch. A countdown timer will be displayed.',
  },
  {
    question: 'How many presale levels are there?',
    answer:
      'There are 10 levels in total. Each level has a time limit of 10 days or until it’s sold out.',
  },
  {
    question: 'Can I claim my tokens immediately?',
    answer:
      'No. Tokens will be claimable in your account after the presale ends. This ensures a fair launch.',
  },
  {
    question: 'Will MemeX be available on mobile?',
    answer:
      'Yes. After the PC Alpha/Beta on Steam (2026), we plan a full cross-platform release for mobile.',
  },
  {
    question: 'What makes MemeX unique?',
    answer:
      'MemeX is the first meme-powered Web3 card game with staking, NFT-based cards, and a community-driven economy.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <h2 className={styles.title}>📜 Frequently Asked Questions</h2>
      <ul className={styles.faqList}>
        {faqData.map((item, index) => (
          <li key={index} className={styles.faqItem}>
            <button
              className={styles.question}
              onClick={() => toggle(index)}
            >
              {item.question}
            </button>
            {openIndex === index && (
              <p className={styles.answer}>{item.answer}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}