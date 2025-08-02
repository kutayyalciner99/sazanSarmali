export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    balance: number;
    totalWins: number;
    totalLosses: number;
    gamesPlayed: number;
    createdAt: Date;
    lastBonusClaim?: Date;
    hasWelcomeBonus: boolean;
  }
  
  export interface GameResult {
    id: string;
    userId: string;
    gameType: GameType;
    betAmount: number;
    winAmount: number;
    multiplier: number;
    timestamp: Date;
    gameData?: Record<string, unknown>; // Specific game data (reels, cards, etc.)
  }
  
  export type GameType = 'sweet-bonanza' | 'gates-of-olympus' | 'mammoth-gold' | 'blackjack' | 'roulette';
  
  export interface SlotResult {
    reels: string[][];
    winLines: number[];
    multiplier: number;
    isBonus: boolean;
    freeSpins?: number;
  }
  
  export interface BlackjackResult {
    playerCards: Card[];
    dealerCards: Card[];
    playerScore: number;
    dealerScore: number;
    result: 'win' | 'lose' | 'push';
  }
  
  export interface RouletteResult {
    number: number;
    color: 'red' | 'black' | 'green';
    bets: RouletteBet[];
    totalWin: number;
  }
  
  export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: string;
    value: number;
  }
  
  export interface RouletteBet {
    type: 'number' | 'color' | 'odd-even' | 'high-low';
    value: string | number;
    amount: number;
  }
  
  export interface Jackpot {
    suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
    amount: number;
    lastWinner?: string;
    lastWon?: Date;
  }
  
  export interface Winner {
    id: string;
    username: string;
    game: string;
    amount: number;
    timestamp: Date;
  }
  
  export type Language = 'tr' | 'en';
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    language: Language;
  }
  
  export interface GameState {
    isPlaying: boolean;
    balance: number;
    currentBet: number;
    autoSpin: boolean;
    lastResult?: GameResult;
  }
  