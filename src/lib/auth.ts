import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createNewUser(email: string, name: string, passwordHash: string): User {
  return {
    id: generateUserId(),
    email,
    name,
    passwordHash,
    balance: 5000, // Starting balance of ₺5,000
    totalWins: 0,
    totalLosses: 0,
    gamesPlayed: 0,
    createdAt: new Date(),
    hasWelcomeBonus: false
  };
}
