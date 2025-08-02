import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyToken } from '../../../../lib/auth';

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

    if (user.hasWelcomeBonus) {
      return NextResponse.json(
        { error: 'Welcome bonus already claimed' },
        { status: 400 }
      );
    }

    // Double the user's current balance (100% bonus)
    const bonusAmount = user.balance;
    const newBalance = user.balance + bonusAmount;

    user.balance = newBalance;
    user.hasWelcomeBonus = true;

    await db.updateUser(user);

    return NextResponse.json({
      newBalance,
      bonusAmount
    });
  } catch (error) {
    console.error('Welcome bonus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
