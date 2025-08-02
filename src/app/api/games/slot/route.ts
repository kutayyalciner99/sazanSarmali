import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyToken } from '../../../../lib/auth';
import { SlotEngine } from '../../../../lib/slotEngine';
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

    const { gameId, betAmount, buyBonus = false } = await request.json();

    if (!gameId || !betAmount || betAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid game ID or bet amount' },
        { status: 400 }
      );
    }

    // Calculate total cost (bet + bonus cost if applicable)
    const bonusCost = buyBonus ? betAmount * 100 : 0; // Bonus costs 100x bet
    const totalCost = betAmount + bonusCost;

    if (user.balance < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create slot engine and spin
    const slotEngine = new SlotEngine(gameId);
    const spinResult = slotEngine.spin(betAmount, buyBonus);

    // Calculate win amount
    const winAmount = Math.floor(spinResult.multiplier * betAmount);
    const netResult = winAmount - totalCost;

    // Update user balance
    const newBalance = user.balance + netResult;
    await db.updateUserBalance(user.id, newBalance);

    // Create game result record
    const gameResult: GameResult = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      gameType: gameId as 'sweet-bonanza' | 'gates-of-olympus' | 'mammoth-gold',
      betAmount: totalCost,
      winAmount,
      multiplier: spinResult.multiplier,
      timestamp: new Date(),
      gameData: {
        reels: spinResult.reels,
        winLines: spinResult.winLines,
        isBonus: spinResult.isBonus,
        freeSpins: spinResult.freeSpins,
        buyBonus
      }
    };

    await db.createGameResult(gameResult);

    // Add to winners feed if significant win
    if (winAmount >= betAmount * 10) {
      await db.addWinner({
        id: Math.random().toString(36).substr(2, 9),
        username: user.name,
        game: gameId,
        amount: winAmount,
        timestamp: new Date()
      });
    }

    return NextResponse.json({
      result: spinResult,
      winAmount,
      newBalance,
      netResult,
      rtp: slotEngine.getTheoreticalRTP()
    });
  } catch (error) {
    console.error('Slot game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
