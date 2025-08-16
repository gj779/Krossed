import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { logSecurityEvent } from '../security';

/**
 * Comprehensive security middleware configuration
 */
export function setupSecurityMiddleware(app: any) {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        connectSrc: ["'self'", "wss:", "ws:", "https://api.stripe.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting - simplified for development
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: { 
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req: Request, res: Response) => {
      await logSecurityEvent({
        eventType: 'rate_limit_exceeded_auth',
        req,
        success: false,
        details: { limit: 'auth', path: req.path }
      });
      res.status(429).json({
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
      });
    }
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { 
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,

    handler: async (req: Request, res: Response) => {
      await logSecurityEvent({
        eventType: 'rate_limit_exceeded_general',
        req,
        success: false,
        details: { limit: 'general', path: req.path }
      });
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
      });
    }
  });

  const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 message requests per minute
    message: { 
      error: 'Too many messages sent, please slow down.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,

  });

  // Apply rate limiters
  app.use('/api/auth', authLimiter);
  app.use('/api/messages', messageLimiter);
  app.use('/api', generalLimiter);

  // Security headers middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature policy
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(self), payment=()');
    
    next();
  });

  // Request sanitization middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Remove potentially dangerous headers
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-original-url'];
    delete req.headers['x-rewrite-url'];
    
    next();
  });

  // Security monitoring middleware
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Log suspicious patterns
    const suspiciousPatterns = [
      /\.\./,           // Directory traversal
      /<script/i,       // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i,   // JavaScript injection
      /vbscript:/i,     // VBScript injection
      /onload/i,        // Event handler injection
      /onerror/i        // Error handler injection
    ];

    const url = req.url.toLowerCase();
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const referer = (req.headers.referer || '').toLowerCase();

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent) || pattern.test(referer)) {
        await logSecurityEvent({
          eventType: 'suspicious_request_pattern',
          req,
          success: false,
          details: { 
            pattern: pattern.toString(),
            url: req.url,
            userAgent: req.headers['user-agent'],
            referer: req.headers.referer
          },
          riskScore: 75
        });
        
        // Block the request
        return res.status(400).json({ error: 'Invalid request' });
      }
    }

    next();
  });

  console.log('🛡️  Security middleware configured');
}

/**
 * Input validation middleware
 */
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize common injection attempts in request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Basic XSS prevention
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/onload/gi, '')
          .replace(/onerror/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

/**
 * CORS configuration for production security
 */
export function setupCORS(app: any) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5000'
    ];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

/**
 * API response security middleware
 */
export function secureApiResponse(req: Request, res: Response, next: NextFunction) {
  // Store original json method
  const originalJson = res.json;

  // Override json method to add security
  res.json = function(obj: any) {
    // Remove sensitive fields from response
    if (obj && typeof obj === 'object') {
      sanitizeResponseData(obj);
    }

    // Set security headers for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return originalJson.call(this, obj);
  };

  next();
}

/**
 * Remove sensitive fields from API responses
 */
function sanitizeResponseData(obj: any): void {
  if (Array.isArray(obj)) {
    obj.forEach(item => sanitizeResponseData(item));
    return;
  }

  if (obj && typeof obj === 'object') {
    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'passwordHash',
      'twoFactorSecret',
      'emailVerificationToken',
      'phoneVerificationToken',
      'passwordResetToken',
      'stripeCustomerId',
      'stripeSubscriptionId',
      'lastIpAddress',
      'deviceIds',
      'loginHistory',
      'failedLoginAttempts'
    ];

    sensitiveFields.forEach(field => {
      delete obj[field];
    });

    // Recursively sanitize nested objects
    Object.values(obj).forEach(value => {
      if (value && typeof value === 'object') {
        sanitizeResponseData(value);
      }
    });
  }
}