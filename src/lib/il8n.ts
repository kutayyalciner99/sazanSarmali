export type Language = 'tr' | 'en';

export const translations = {
  tr: {
    // Navigation
    newGames: 'Yeni Oyunlar',
    popularSlots: 'Popüler Slotlar',
    dropsWins: 'Drops & Wins',
    roulette: 'Rulet',
    blackjack: 'Blackjack',
    liveLobby: 'Live Lobby',
    buyBonus: 'Bonus Satın Al',

    // Authentication
    login: 'Giriş',
    register: 'Kayıt Ol',
    logout: 'Çıkış',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrarı',
    name: 'İsim',

    // User Interface
    balance: 'Bakiye',
    bet: 'Bahis',
    spin: 'Çevir',
    autoSpin: 'Otomatik Çevir',
    maxBet: 'Max Bahis',
    feelingLucky: 'Şanslı hissediyorum',

    // Games
    sweetBonanza: 'Sweet Bonanza',
    gatesOfOlympus: 'Gates of Olympus',
    mammothGold: 'Mammoth Gold',

    // Jackpots
    jackpots: 'Jackpotlar',
    spades: 'Maça',
    hearts: 'Kupa',
    diamonds: 'Karo',
    clubs: 'Sinek',

    // Winners
    recentWinners: 'Son Kazananlar',

    // Bonuses
    welcomeBonus: '100% Casino Hoş Geldin Bonusu',
    dailyBonus: 'Günlük Bonus',
    claimBonus: 'Bonus Al',

    // Game Results
    win: 'Kazandınız!',
    lose: 'Kaybettiniz',
    bigWin: 'Büyük Kazanç!',
    megaWin: 'Mega Kazanç!',

    // Profile
    profile: 'Profil',
    totalWins: 'Toplam Kazanç',
    totalLosses: 'Toplam Kayıp',
    gamesPlayed: 'Oynanan Oyun',

    // Currency
    currency: '₺'
  },
  en: {
    // Navigation
    newGames: 'New Games',
    popularSlots: 'Popular Slots',
    dropsWins: 'Drops & Wins',
    roulette: 'Roulette',
    blackjack: 'Blackjack',
    liveLobby: 'Live Lobby',
    buyBonus: 'Buy Bonus',

    // Authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',

    // User Interface
    balance: 'Balance',
    bet: 'Bet',
    spin: 'Spin',
    autoSpin: 'Auto Spin',
    maxBet: 'Max Bet',
    feelingLucky: 'Feeling Lucky',

    // Games
    sweetBonanza: 'Sweet Bonanza',
    gatesOfOlympus: 'Gates of Olympus',
    mammothGold: 'Mammoth Gold',

    // Jackpots
    jackpots: 'Jackpots',
    spades: 'Spades',
    hearts: 'Hearts',
    diamonds: 'Diamonds',
    clubs: 'Clubs',

    // Winners
    recentWinners: 'Recent Winners',

    // Bonuses
    welcomeBonus: '100% Casino Welcome Bonus',
    dailyBonus: 'Daily Bonus',
    claimBonus: 'Claim Bonus',

    // Game Results
    win: 'You Win!',
    lose: 'You Lose',
    bigWin: 'Big Win!',
    megaWin: 'Mega Win!',

    // Profile
    profile: 'Profile',
    totalWins: 'Total Wins',
    totalLosses: 'Total Losses',
    gamesPlayed: 'Games Played',

    // Currency
    currency: '$'
  }
};

export function getTranslation(key: keyof typeof translations.tr, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}
