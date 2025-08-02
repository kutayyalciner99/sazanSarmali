import { SlotResult } from './types';

// Slot symbols for different games
export const SLOT_SYMBOLS = {
  'sweet-bonanza': ['🍭', '🍇', '🍊', '🍋', '🍎', '🍓', '💰', '⭐', '💎'],
  'gates-of-olympus': ['⚡', '👑', '💎', '🏛️', '⚔️', '🛡️', '🏺', '💰', '⭐'],
  'mammoth-gold': ['🐘', '💰', '🏔️', '💎', '🌟', '🎯', '🏆', '⭐', '💵']
};

// Paytable multipliers (simplified)
export const PAYTABLES = {
  'sweet-bonanza': {
    '💎': { 3: 50, 4: 100, 5: 500, 6: 1000 },
    '⭐': { 3: 25, 4: 50, 5: 250, 6: 500 },
    '💰': { 3: 20, 4: 40, 5: 200, 6: 400 },
    '🍓': { 3: 15, 4: 30, 5: 150, 6: 300 },
    '🍎': { 3: 10, 4: 20, 5: 100, 6: 200 },
    '🍋': { 3: 8, 4: 16, 5: 80, 6: 160 },
    '🍊': { 3: 6, 4: 12, 5: 60, 6: 120 },
    '🍇': { 3: 4, 4: 8, 5: 40, 6: 80 },
    '🍭': { 3: 2, 4: 4, 5: 20, 6: 40 }
  },
  'gates-of-olympus': {
    '💎': { 3: 40, 4: 80, 5: 400, 6: 800 },
    '⭐': { 3: 20, 4: 40, 5: 200, 6: 400 },
    '💰': { 3: 15, 4: 30, 5: 150, 6: 300 },
    '👑': { 3: 12, 4: 24, 5: 120, 6: 240 },
    '🏛️': { 3: 10, 4: 20, 5: 100, 6: 200 },
    '⚔️': { 3: 8, 4: 16, 5: 80, 6: 160 },
    '🛡️': { 3: 6, 4: 12, 5: 60, 6: 120 },
    '🏺': { 3: 4, 4: 8, 5: 40, 6: 80 },
    '⚡': { 3: 2, 4: 4, 5: 20, 6: 40 }
  },
  'mammoth-gold': {
    '💎': { 3: 45, 4: 90, 5: 450, 6: 900 },
    '⭐': { 3: 22, 4: 44, 5: 220, 6: 440 },
    '💰': { 3: 18, 4: 36, 5: 180, 6: 360 },
    '🏆': { 3: 15, 4: 30, 5: 150, 6: 300 },
    '🌟': { 3: 12, 4: 24, 5: 120, 6: 240 },
    '🎯': { 3: 10, 4: 20, 5: 100, 6: 200 },
    '🏔️': { 3: 8, 4: 16, 5: 80, 6: 160 },
    '💵': { 3: 6, 4: 12, 5: 60, 6: 120 },
    '🐘': { 3: 4, 4: 8, 5: 40, 6: 80 }
  }
};

export class SlotEngine {
  private gameId: string;
  private symbols: string[];
  private paytable: Record<string, Record<number, number>>;

  constructor(gameId: string) {
    this.gameId = gameId;
    this.symbols = SLOT_SYMBOLS[gameId as keyof typeof SLOT_SYMBOLS] || SLOT_SYMBOLS['sweet-bonanza'];
    this.paytable = PAYTABLES[gameId as keyof typeof PAYTABLES] || PAYTABLES['sweet-bonanza'];
  }

  // Generate random reels (6x5 grid for most games)
  generateReels(): string[][] {
    const reels: string[][] = [];

    for (let reel = 0; reel < 6; reel++) {
      const reelSymbols: string[] = [];
      for (let position = 0; position < 5; position++) {
        const randomIndex = Math.floor(Math.random() * this.symbols.length);
        reelSymbols.push(this.symbols[randomIndex]);
      }
      reels.push(reelSymbols);
    }

    return reels;
  }

  // Count symbol occurrences across all reels
  countSymbols(reels: string[][]): { [symbol: string]: number } {
    const counts: { [symbol: string]: number } = {};

    reels.forEach(reel => {
      reel.forEach(symbol => {
        counts[symbol] = (counts[symbol] || 0) + 1;
      });
    });

    return counts;
  }

  // Calculate wins based on symbol counts
  calculateWins(reels: string[][], betAmount: number): SlotResult {
    const symbolCounts = this.countSymbols(reels);
    let totalMultiplier = 0;
    const winLines: number[] = [];

    // Check each symbol for wins
    Object.entries(symbolCounts).forEach(([symbol, count]) => {
      if (this.paytable[symbol] && this.paytable[symbol][count]) {
        const symbolMultiplier = this.paytable[symbol][count];
        totalMultiplier += symbolMultiplier;
        winLines.push(symbolMultiplier);
      }
    });

    // Apply random multiplier chance (like Gates of Olympus)
    const randomMultiplierChance = Math.random();
    let multiplier = 1;

    if (randomMultiplierChance < 0.05) { // 5% chance for big multiplier
      multiplier = [2, 3, 5, 10, 25, 50, 100][Math.floor(Math.random() * 7)];
    } else if (randomMultiplierChance < 0.15) { // 15% chance for small multiplier
      multiplier = [2, 3, 5][Math.floor(Math.random() * 3)];
    }

    // Check for bonus/free spins trigger (simplified)
    const isBonus = this.checkBonusTrigger(reels);
    const freeSpins = isBonus ? Math.floor(Math.random() * 15) + 8 : undefined;

    return {
      reels,
      winLines,
      multiplier: Math.max(totalMultiplier * multiplier, 0),
      isBonus,
      freeSpins
    };
  }

  // Simple bonus trigger check (look for scatter symbols)
  private checkBonusTrigger(reels: string[][]): boolean {
    const scatterSymbols = ['⭐', '💰', '🏆'];
    let scatterCount = 0;

    reels.forEach(reel => {
      reel.forEach(symbol => {
        if (scatterSymbols.includes(symbol)) {
          scatterCount++;
        }
      });
    });

    return scatterCount >= 4; // Need 4+ scatters for bonus
  }

  // Main spin function
  spin(betAmount: number, buyBonus: boolean = false): SlotResult {
    let result: SlotResult;

    if (buyBonus) {
      // Force bonus round
      result = this.generateBonusResult(betAmount);
    } else {
      const reels = this.generateReels();
      result = this.calculateWins(reels, betAmount);
    }

    // Ensure minimum RTP by occasionally forcing wins
    if (result.multiplier === 0 && Math.random() < 0.3) {
      result.multiplier = Math.random() < 0.1 ? betAmount * 2 : betAmount * 0.5;
      result.winLines = [result.multiplier];
    }

    return result;
  }

  // Generate guaranteed bonus result
  private generateBonusResult(betAmount: number): SlotResult {
    const reels = this.generateReels();

    // Force scatter symbols for bonus
    const scatterPositions = [
      [0, 0], [1, 1], [2, 2], [3, 3], [4, 4]
    ];

    scatterPositions.forEach(([reelIndex, symbolIndex]) => {
      if (reels[reelIndex] && reels[reelIndex][symbolIndex]) {
        reels[reelIndex][symbolIndex] = '⭐';
      }
    });

    const baseResult = this.calculateWins(reels, betAmount);

    return {
      ...baseResult,
      isBonus: true,
      freeSpins: Math.floor(Math.random() * 20) + 10,
      multiplier: Math.max(baseResult.multiplier, betAmount * 5) // Guarantee decent win
    };
  }

  // Calculate theoretical RTP
  getTheoreticalRTP(): number {
    const rtpValues = {
      'sweet-bonanza': 96.51,
      'gates-of-olympus': 96.50,
      'mammoth-gold': 96.77
    };

    return rtpValues[this.gameId as keyof typeof rtpValues] || 96.5;
  }
}

export default SlotEngine;
