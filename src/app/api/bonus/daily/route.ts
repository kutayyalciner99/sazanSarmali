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

    // Check if user has already claimed daily bonus today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastBonusClaim) {
      const lastClaim = new Date(user.lastBonusClaim);
      const lastClaimDate = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());

      if (lastClaimDate.getTime() === today.getTime()) {
        return NextResponse.json(
          { error: 'Daily bonus already claimed today' },
          { status: 400 }
        );
      }
    }

    // Add daily bonus of ₺1000
    const bonusAmount = 1000;
    const newBalance = user.balance + bonusAmount;

    user.balance = newBalance;
    user.lastBonusClaim = now;

    await db.updateUser(user);

    return NextResponse.json({
      newBalance,
      bonusAmount,
      lastBonusClaim: now
    });
  } catch (error) {
    console.error('Daily bonus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
