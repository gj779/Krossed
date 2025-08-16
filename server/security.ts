import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { storage } from './storage';
import type { Request } from 'express';
import type { InsertSecurityLog } from '@shared/schema';
import { DataAnonymization } from './encryption';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const SALT_ROUNDS = 14; // Increased for better security

// Ensure JWT secret is strong enough
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  No JWT_SECRET environment variable found. Using temporary secret.');
  console.warn('🔑 For production, set JWT_SECRET environment variable');
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token utilities
export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, type: decoded.type };
  } catch {
    return null;
  }
}

// Email/Phone verification tokens
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateSMSCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Password reset tokens
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Two-Factor Authentication
export function generate2FASecret(): string {
  return authenticator.generateSecret();
}

export async function generate2FAQRCode(email: string, secret: string): Promise<string> {
  const serviceName = 'Criss-Cross Dating';
  const otpauthUrl = authenticator.keyuri(email, serviceName, secret);
  return QRCode.toDataURL(otpauthUrl);
}

export function verify2FAToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

// Device fingerprinting
export function generateDeviceFingerprint(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(userAgent + acceptLanguage + acceptEncoding)
    .digest('hex');
  
  return fingerprint.substring(0, 16);
}

// Risk assessment
export function calculateRiskScore(req: Request, user: any): number {
  let riskScore = 0;
  
  // Check for unusual login times (basic heuristic)
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) riskScore += 10; // Unusual login time
  
  // Check failed login attempts
  if (user?.failedLoginAttempts > 3) riskScore += 30;
  if (user?.failedLoginAttempts > 5) riskScore += 50;
  
  // Check account age (newer accounts are slightly riskier)
  if (user?.accountCreatedAt) {
    const daysSinceCreation = (Date.now() - new Date(user.accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) riskScore += 20;
    else if (daysSinceCreation < 7) riskScore += 10;
  }
  
  // Check if IP has changed (basic check)
  const currentIP = req.ip || req.connection.remoteAddress;
  if (user?.lastIpAddress && user.lastIpAddress !== currentIP) {
    riskScore += 15;
  }
  
  return Math.min(riskScore, 100); // Cap at 100
}

// IP geolocation (mock - in real implementation, use a service like MaxMind)
export function getLocationFromIP(ip: string): string {
  // Mock implementation - in production, use a proper IP geolocation service
  if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'Local Network';
  }
  return 'Unknown Location';
}

// Security logging with data anonymization
export async function logSecurityEvent(params: {
  userId?: string;
  eventType: string;
  req: Request;
  success?: boolean;
  details?: any;
  riskScore?: number;
}): Promise<void> {
  const { userId, eventType, req, success = true, details = {}, riskScore = 0 } = params;
  
  // Anonymize sensitive data in details
  const sanitizedDetails = { ...details };
  if (sanitizedDetails.email) {
    sanitizedDetails.email = DataAnonymization.anonymizeEmail(sanitizedDetails.email);
  }
  if (sanitizedDetails.phone) {
    sanitizedDetails.phone = DataAnonymization.anonymizePhone(sanitizedDetails.phone);
  }
  
  const securityLog: InsertSecurityLog = {
    userId,
    eventType,
    ipAddress: DataAnonymization.anonymizeIP(req.ip || req.connection.remoteAddress || 'unknown'),
    userAgent: req.headers['user-agent'],
    deviceFingerprint: generateDeviceFingerprint(req),
    success,
    details: JSON.stringify(sanitizedDetails),
    riskScore,
    location: getLocationFromIP(req.ip || ''),
  };
  
  try {
    await storage.createSecurityLog(securityLog);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Account security checks
export function isAccountLocked(user: any): boolean {
  if (!user.accountLockedUntil) return false;
  return new Date() < new Date(user.accountLockedUntil);
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= 5;
}

export function calculateLockDuration(failedAttempts: number): number {
  // Progressive lockout: 5 minutes for 5 attempts, 30 minutes for 10+
  if (failedAttempts >= 10) return 30 * 60 * 1000; // 30 minutes
  if (failedAttempts >= 5) return 5 * 60 * 1000; // 5 minutes
  return 0;
}

// Validation utilities
export function isStrongPassword(password: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (password.length < 8) issues.push('Password must be at least 8 characters');
  if (password.length > 128) issues.push('Password must be less than 128 characters');
  if (!/[A-Z]/.test(password)) issues.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) issues.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) issues.push('Password must contain at least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) issues.push('Password must contain at least one special character');
  
  // Check for common passwords (basic check)
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    issues.push('Password is too common');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// Session management
export function createSessionData(userId: string) {
  return {
    userId,
    createdAt: new Date(),
    lastActive: new Date(),
  };
}

export function isSessionExpired(lastActive: Date, maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
  return Date.now() - lastActive.getTime() > maxAgeMs;
}