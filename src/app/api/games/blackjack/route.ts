import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyToken } from '../../../../lib/auth';
import { BlackjackEngine } from '../../../../lib/blackjackEngine';
import { GameResult } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { action, betAmount, gameState } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const blackjackEngine = new BlackjackEngine();

    switch (action) {
      case 'start': {
        if (!betAmount || betAmount <= 0) {
          return NextResponse.json(
            { error: 'Valid bet amount is required' },
            { status: 400 }
          );
        }

        if (user.balance < betAmount) {
          return NextResponse.json(
            { error: 'Insufficient balance' },
            { status: 400 }
          );
        }

        // Deduct bet from balance
        await db.updateUserBalance(user.id, user.balance - betAmount);

        const { playerCards, dealerCards } = blackjackEngine.startGame();

        return NextResponse.json({
          playerCards,
          dealerCards: [dealerCards[0]], // Hide dealer's second card
          dealerHiddenCard: dealerCards[1],
          playerScore: blackjackEngine['calculateScore'](playerCards),
          betAmount,
          gameId: Math.random().toString(36).substr(2, 9)
        });
      }

      case 'hit': {
        if (!gameState?.playerCards) {
          return NextResponse.json(
            { error: 'Invalid game state' },
            { status: 400 }
          );
        }

        const newCard = blackjackEngine.hit(gameState.playerCards);
        const updatedPlayerCards = [...gameState.playerCards, newCard];
        const playerScore = blackjackEngine['calculateScore'](updatedPlayerCards);

        // Check if player busted
        const isBust = playerScore > 21;
        let result = null;
        let winAmount = 0;
        let newBalance = user.balance;

        if (isBust) {
          // Player busted, dealer wins
          const dealerCards = [...gameState.dealerCards, gameState.dealerHiddenCard];
          result = blackjackEngine.determineWinner(updatedPlayerCards, dealerCards);
          winAmount = 0; // Player loses bet

          // Game result will be recorded when game ends
        }

        return NextResponse.json({
          playerCards: updatedPlayerCards,
          playerScore,
          newCard,
          isBust,
          result,
          winAmount,
          newBalance
        });
      }

      case 'stand': {
        if (!gameState?.playerCards || !gameState?.dealerHiddenCard) {
          return NextResponse.json(
            { error: 'Invalid game state' },
            { status: 400 }
          );
        }

        // Reveal dealer's hidden card and play dealer hand
        const dealerCards = blackjackEngine.playDealerHand([
          ...gameState.dealerCards,
          gameState.dealerHiddenCard
        ]);

        const result = blackjackEngine.determineWinner(gameState.playerCards, dealerCards);
        const multiplier = blackjackEngine.getPayoutMultiplier(result);
        const winAmount = Math.floor(gameState.betAmount * multiplier);
        const newBalance = user.balance + winAmount;

        // Update balance
        await db.updateUserBalance(user.id, newBalance);

        // Record game result
        const gameResult: GameResult = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          gameType: 'blackjack',
          betAmount: gameState.betAmount,
          winAmount,
          multiplier,
          timestamp: new Date(),
          gameData: {
            playerCards: result.playerCards,
            dealerCards: result.dealerCards,
            playerScore: result.playerScore,
            dealerScore: result.dealerScore,
            result: result.result
          }
        };

        await db.createGameResult(gameResult);

        // Add to winners feed if significant win
        if (winAmount >= gameState.betAmount * 2) {
          await db.addWinner({
            id: Math.random().toString(36).substr(2, 9),
            username: user.name,
            game: 'Blackjack',
            amount: winAmount,
            timestamp: new Date()
          });
        }

        return NextResponse.json({
          dealerCards,
          dealerScore: result.dealerScore,
          result: result.result,
          winAmount,
          newBalance,
          multiplier
        });
      }

      case 'double': {
        if (!gameState?.playerCards || gameState.playerCards.length !== 2) {
          return NextResponse.json(
            { error: 'Can only double on initial hand' },
            { status: 400 }
          );
        }

        if (user.balance < gameState.betAmount) {
          return NextResponse.json(
            { error: 'Insufficient balance to double' },
            { status: 400 }
          );
        }

        // Deduct additional bet
        await db.updateUserBalance(user.id, user.balance - gameState.betAmount);

        // Hit once and stand
        const newCard = blackjackEngine.hit(gameState.playerCards);
        const playerCards = [...gameState.playerCards, newCard];
        const playerScore = blackjackEngine['calculateScore'](playerCards);

        // Play dealer hand
        const dealerCards = blackjackEngine.playDealerHand([
          ...gameState.dealerCards,
          gameState.dealerHiddenCard
        ]);

        const result = blackjackEngine.determineWinner(playerCards, dealerCards);
        const multiplier = blackjackEngine.getPayoutMultiplier(result);
        const doubledBet = gameState.betAmount * 2;
        const winAmount = Math.floor(doubledBet * multiplier);
        const newBalance = user.balance + winAmount;

        // Update balance
        await db.updateUserBalance(user.id, newBalance);

        // Record game result
        const gameResult: GameResult = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          gameType: 'blackjack',
          betAmount: doubledBet,
          winAmount,
          multiplier,
          timestamp: new Date(),
          gameData: {
            playerCards: result.playerCards,
            dealerCards: result.dealerCards,
            playerScore: result.playerScore,
            dealerScore: result.dealerScore,
            result: result.result,
            doubled: true
          }
        };

        await db.createGameResult(gameResult);

        return NextResponse.json({
          playerCards,
          playerScore,
          dealerCards,
          dealerScore: result.dealerScore,
          result: result.result,
          winAmount,
          newBalance,
          multiplier,
          doubled: true
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Blackjack game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
