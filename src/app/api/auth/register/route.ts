import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { hashPassword, generateToken, createNewUser } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = createNewUser(email, name, passwordHash);

    await db.createUser(newUser);

    const token = generateToken(newUser);

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
