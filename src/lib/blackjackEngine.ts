import { Card, BlackjackResult } from './types';

export class BlackjackEngine {
  private deck: Card[] = [];

  constructor() {
    this.resetDeck();
  }

  private resetDeck(): void {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    this.deck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        this.deck.push({
          suit,
          rank,
          value: this.getCardValue(rank)
        });
      });
    });

    // Shuffle deck
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private getCardValue(rank: string): number {
    if (rank === 'A') return 11; // Ace can be 1 or 11, we'll handle this in scoring
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
  }

  private drawCard(): Card {
    if (this.deck.length === 0) {
      this.resetDeck();
    }
    return this.deck.pop()!;
  }

  private calculateScore(cards: Card[]): number {
    let score = 0;
    let aces = 0;

    cards.forEach(card => {
      if (card.rank === 'A') {
        aces++;
        score += 11;
      } else {
        score += card.value;
      }
    });

    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10; // Convert ace from 11 to 1
      aces--;
    }

    return score;
  }

  private shouldDealerHit(dealerCards: Card[]): boolean {
    const score = this.calculateScore(dealerCards);

    // Dealer hits on soft 17 (ace counting as 11)
    if (score < 17) return true;
    if (score === 17) {
      // Check if it's a soft 17 (contains ace counting as 11)
      let aceAs11 = false;
      let tempScore = 0;
      dealerCards.forEach(card => {
        if (card.rank === 'A' && tempScore + 11 <= 17) {
          aceAs11 = true;
          tempScore += 11;
        } else if (card.rank === 'A') {
          tempScore += 1;
        } else {
          tempScore += card.value;
        }
      });
      return aceAs11 && tempScore === 17;
    }

    return false;
  }

  startGame(): { playerCards: Card[]; dealerCards: Card[] } {
    this.resetDeck();

    const playerCards = [this.drawCard(), this.drawCard()];
    const dealerCards = [this.drawCard(), this.drawCard()];

    return { playerCards, dealerCards };
  }

  hit(cards: Card[]): Card {
    return this.drawCard();
  }

  playDealerHand(dealerCards: Card[]): Card[] {
    const cards = [...dealerCards];

    while (this.shouldDealerHit(cards)) {
      cards.push(this.drawCard());
    }

    return cards;
  }

  determineWinner(playerCards: Card[], dealerCards: Card[]): BlackjackResult {
    const playerScore = this.calculateScore(playerCards);
    const dealerScore = this.calculateScore(dealerCards);

    let result: 'win' | 'lose' | 'push';

    // Player bust
    if (playerScore > 21) {
      result = 'lose';
    }
    // Dealer bust
    else if (dealerScore > 21) {
      result = 'win';
    }
    // Both have blackjack
    else if (playerScore === 21 && dealerScore === 21 && playerCards.length === 2 && dealerCards.length === 2) {
      result = 'push';
    }
    // Player blackjack
    else if (playerScore === 21 && playerCards.length === 2) {
      result = 'win';
    }
    // Dealer blackjack
    else if (dealerScore === 21 && dealerCards.length === 2) {
      result = 'lose';
    }
    // Compare scores
    else if (playerScore > dealerScore) {
      result = 'win';
    }
    else if (playerScore < dealerScore) {
      result = 'lose';
    }
    else {
      result = 'push';
    }

    return {
      playerCards,
      dealerCards,
      playerScore,
      dealerScore,
      result
    };
  }

  getCardDisplayValue(card: Card): string {
    return card.rank;
  }

  getSuitSymbol(suit: Card['suit']): string {
    const symbols = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    };
    return symbols[suit];
  }

  getSuitColor(suit: Card['suit']): string {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-300';
  }

  getPayoutMultiplier(result: BlackjackResult): number {
    if (result.result === 'lose') return 0;
    if (result.result === 'push') return 1; // Return bet

    // Blackjack pays 3:2
    if (result.playerScore === 21 && result.playerCards.length === 2) {
      return 2.5; // 1.5x win + 1x return = 2.5x total
    }

    // Regular win pays 1:1
    return 2; // 1x win + 1x return = 2x total
  }
}

export default BlackjackEngine;
