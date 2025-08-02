import { User, GameResult, Jackpot, Winner } from './types';

// In-memory database for development (in production, use a real database)
class Database {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private gameResults: GameResult[] = [];
  private jackpots: Jackpot[] = [
    { suit: 'spades', amount: 25000, lastWinner: undefined, lastWon: undefined },
    { suit: 'hearts', amount: 18750, lastWinner: undefined, lastWon: undefined },
    { suit: 'diamonds', amount: 32100, lastWinner: undefined, lastWon: undefined },
    { suit: 'clubs', amount: 14500, lastWinner: undefined, lastWon: undefined }
  ];
  private winners: Winner[] = [];

  // User methods
  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async updateUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.balance = newBalance;
      this.users.set(userId, user);
      this.usersByEmail.set(user.email, user);
    }
  }

  // Game result methods
  async createGameResult(result: GameResult): Promise<GameResult> {
    this.gameResults.push(result);

    // Update user stats
    const user = this.users.get(result.userId);
    if (user) {
      user.gamesPlayed++;
      if (result.winAmount > 0) {
        user.totalWins += result.winAmount;
      } else {
        user.totalLosses += result.betAmount;
      }
      await this.updateUser(user);
    }

    return result;
  }

  async getGameResultsByUser(userId: string): Promise<GameResult[]> {
    return this.gameResults.filter(result => result.userId === userId);
  }

  // Jackpot methods
  async getJackpots(): Promise<Jackpot[]> {
    return [...this.jackpots];
  }

  async updateJackpot(suit: string, amount: number): Promise<void> {
    const jackpot = this.jackpots.find(j => j.suit === suit);
    if (jackpot) {
      jackpot.amount = amount;
    }
  }

  async triggerJackpot(suit: string, winner: string): Promise<number> {
    const jackpot = this.jackpots.find(j => j.suit === suit);
    if (jackpot) {
      const winAmount = jackpot.amount;
      jackpot.lastWinner = winner;
      jackpot.lastWon = new Date();
      jackpot.amount = Math.floor(Math.random() * 10000) + 5000; // Reset to random amount
      return winAmount;
    }
    return 0;
  }

  // Winner methods
  async addWinner(winner: Winner): Promise<void> {
    this.winners.unshift(winner);
    // Keep only last 50 winners
    if (this.winners.length > 50) {
      this.winners = this.winners.slice(0, 50);
    }
  }

  async getRecentWinners(limit: number = 10): Promise<Winner[]> {
    return this.winners.slice(0, limit);
  }

  // Generate fake winners for demo
  generateFakeWinner(): void {
    const fakeNames = [
      'Ahmet_K', 'Mehmet_Y', 'Ayşe_D', 'Fatma_S', 'Ali_R', 'Zeynep_T',
      'Mustafa_L', 'Elif_A', 'Ömer_B', 'Selin_G', 'Player123', 'Lucky777',
      'Winner88', 'GoldRush', 'SlotKing', 'CasinoStar', 'BigWin99', 'Jackpot21'
    ];

    const games = ['Sweet Bonanza', 'Gates of Olympus', 'Mammoth Gold', 'Blackjack', 'Roulette'];

    const winner: Winner = {
      id: Math.random().toString(36).substr(2, 9),
      username: fakeNames[Math.floor(Math.random() * fakeNames.length)],
      game: games[Math.floor(Math.random() * games.length)],
      amount: Math.floor(Math.random() * 50000) + 100,
      timestamp: new Date()
    };

    this.addWinner(winner);
  }

  // Initialize with some fake data
  init(): void {
    // Generate some fake winners
    for (let i = 0; i < 20; i++) {
      this.generateFakeWinner();
    }

    // Start fake winner generation every 10 seconds
    setInterval(() => {
      this.generateFakeWinner();
    }, 10000);

    // Increase jackpots every 5 seconds
    setInterval(() => {
      this.jackpots.forEach(jackpot => {
        jackpot.amount += Math.floor(Math.random() * 100) + 10;
      });
    }, 5000);

    // Randomly trigger jackpots every minute
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every minute
        const randomJackpot = this.jackpots[Math.floor(Math.random() * this.jackpots.length)];
        const fakeNames = ['Lucky777', 'BigWinner', 'JackpotKing', 'GoldRush'];
        const fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        this.triggerJackpot(randomJackpot.suit, fakeName);
      }
    }, 60000);
  }
}

export const db = new Database();

// Initialize the database
if (typeof window === 'undefined') {
  db.init();
}
