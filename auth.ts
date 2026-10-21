import crypto from 'crypto';
import { db, User } from './db.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'ndao-auto-secure-session-key-2026';
const sessions = new Map<string, { userId: string; role: 'owner' | 'client'; expiresAt: number }>();
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function generateToken(user: User): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000; // 7 days
  sessions.set(token, {
    userId: user.id,
    role: user.role,
    expiresAt,
  });
  return token;
}

export function verifyToken(token: string): { user: User; role: 'owner' | 'client' } | null {
  if (!token) return null;
  const sess = sessions.get(token);
  if (!sess) return null;
  if (Date.now() > sess.expiresAt) {
    sessions.delete(token);
    return null;
  }
  const user = db.findUserById(sess.userId);
  if (!user) return null;
  return { user, role: sess.role };
}

export function revokeToken(token: string) {
  sessions.delete(token);
}

export function checkRateLimit(identifier: string): { allowed: boolean; waitMinutes?: number } {
  const record = loginAttempts.get(identifier);
  if (!record) return { allowed: true };
  if (record.lockedUntil > Date.now()) {
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { allowed: false, waitMinutes: remaining };
  }
  return { allowed: true };
}

export function recordFailedAttempt(identifier: string) {
  const record = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
    record.count = 0;
  }
  loginAttempts.set(identifier, record);
}

export function clearFailedAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}
