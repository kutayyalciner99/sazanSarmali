import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const jackpots = await db.getJackpots();

    // Convert to object format for easier frontend consumption
    const jackpotMap = jackpots.reduce((acc, jackpot) => {
      acc[jackpot.suit] = jackpot.amount;
      return acc;
    }, {} as { [key: string]: number });

    return NextResponse.json(jackpotMap);
  } catch (error) {
    console.error('Jackpots fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
