import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const winners = await db.getRecentWinners(limit);

    return NextResponse.json(winners);
  } catch (error) {
    console.error('Winners fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
