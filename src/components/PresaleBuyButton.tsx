'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { supabase } from '@/lib/supabaseClient';

const TREASURY_ADDRESS = '42MZFG1imQ9eE6z3YNgC8LgeFVH3u8csppbnRNDAdtYw';
const MEMEX_RATE_PER_SOL = 1800000; // Level 1, adjust later
const CURRENT_LEVEL = 1;

export default function PresaleBuyButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [status, setStatus] = useState('');
  const [solAmount, setSolAmount] = useState(0.1); // Default 0.1 SOL
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!publicKey) return setStatus('⚠️ Please connect your wallet first.');
    if (solAmount <= 0) return setStatus('⚠️ Please enter a valid amount.');

    try {
      setLoading(true);
      setStatus('🟡 Sending transaction...');

      const lamports = solAmount * 1_000_000_000;
      const toPubkey = new PublicKey(TREASURY_ADDRESS);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports: lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const memexAmount = solAmount * MEMEX_RATE_PER_SOL;

      const { error } = await supabase.from('presale_orders').insert({
        wallet: publicKey.toBase58(),
        sol_amount: solAmount,
        memex_amount: memexAmount,
        level: CURRENT_LEVEL,
        tx_hash: signature,
      });

      if (error) {
        setStatus(`⚠️ Supabase error: ${error.message}`);
      } else {
        setStatus(`✅ Success! You bought ${memexAmount.toLocaleString()} MEMEX`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Transaction failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={solAmount}
        onChange={(e) => setSolAmount(parseFloat(e.target.value))}
        placeholder="Amount in SOL"
        style={{
          padding: '10px',
          borderRadius: '10px',
          border: 'none',
          marginBottom: '10px',
          width: '140px',
          textAlign: 'center',
        }}
      />

      <button
        onClick={handleBuy}
        disabled={loading}
        style={{
          backgroundColor: '#8c4fff',
          color: 'white',
          fontSize: '16px',
          padding: '12px 24px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '10px',
        }}
      >
        {loading ? 'Processing...' : 'Buy MEMEX'}
      </button>

      {status && <p style={{ color: '#ccc', marginTop: '10px' }}>{status}</p>}
    </div>
  );
}