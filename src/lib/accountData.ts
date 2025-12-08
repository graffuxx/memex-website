export const getUserData = async (wallet: string | null, email: string | null) => {
  // Wenn weder Wallet noch E-Mail vorhanden, nichts zurückgeben
  if (!wallet && !email) return null;

  // Dummy-Daten für eingeloggte User (Wallet ODER Email)
  return {
    memexPurchased: 32500,
    nfts: [
      { id: 'nft1', name: 'Swollen Doge', image: '/background-card.png' },
      { id: 'nft2', name: 'Memelon', image: '/background-card.png' },
      { id: 'nft3', name: 'Kekus', image: '/background-card.png' },
    ],
    staking: {
      status: 'locked',
      info: 'Staking will be available after the Presale ends.',
    },
  };
};