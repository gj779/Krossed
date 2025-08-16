import type { Request, Response, NextFunction } from 'express';
import { verifyToken, logSecurityEvent, isAccountLocked } from './security';
import { storage } from './storage';

// Session management
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    loginTime?: Date;
    lastActivity?: Date;
  }
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Check session first
    if (req.session.userId && req.session.accessToken) {
      const tokenData = verifyToken(req.session.accessToken);
      
      if (tokenData && tokenData.userId === req.session.userId) {
        // Get user from storage
        const user = await storage.getUser(tokenData.userId);
        
        if (user) {
          // Check if account is locked
          if (isAccountLocked(user)) {
            await logSecurityEvent({
              userId: user.id,
              eventType: 'login_attempt_locked_account',
              req,
              success: false,
              details: { reason: 'Account locked' }
            });
            return res.status(423).json({ message: 'Account is temporarily locked' });
          }

          // Check if user is banned
          if (user.isBanned) {
            const banMessage = user.bannedUntil 
              ? `Account is banned until ${user.bannedUntil}`
              : 'Account is permanently banned';
            return res.status(403).json({ message: banMessage });
          }

          req.user = user;
          req.session.lastActivity = new Date();
          
          // Update user's last active time
          await storage.updateUser(user.id, { lastActive: new Date() });
          
          return next();
        }
      }
    }

    // Check Authorization header as fallback
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const tokenData = verifyToken(token);
      
      if (tokenData) {
        const user = await storage.getUser(tokenData.userId);
        if (user && !isAccountLocked(user) && !user.isBanned) {
          req.user = user;
          await storage.updateUser(user.id, { lastActive: new Date() });
          return next();
        }
      }
    }

    // No valid authentication found
    await logSecurityEvent({
      eventType: 'unauthorized_access_attempt',
      req,
      success: false,
      details: { endpoint: req.path }
    });

    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Try to authenticate but don't fail if no auth is provided
    if (req.session.userId && req.session.accessToken) {
      const tokenData = verifyToken(req.session.accessToken);
      
      if (tokenData && tokenData.userId === req.session.userId) {
        const user = await storage.getUser(tokenData.userId);
        if (user && !isAccountLocked(user) && !user.isBanned) {
          req.user = user;
          req.session.lastActivity = new Date();
          await storage.updateUser(user.id, { lastActive: new Date() });
        }
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.error('Optional auth error:', error);
  }
  
  next();
}

export async function requirePremium(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get fresh user data to check premium status
    const user = await storage.getUser(req.user.id);
    if (!user || !user.isPremium) {
      return res.status(403).json({ 
        message: 'Premium subscription required',
        upgradeUrl: '/subscribe'
      });
    }
    
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export function requireEmailVerification(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ message: 'Email verification required' });
  }
  
  next();
}

export function requirePhotoVerification(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!req.user.isPhotoVerified) {
    return res.status(403).json({ message: 'Photo verification required' });
  }
  
  next();
}