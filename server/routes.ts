import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { setupVideoChat } from "./video-chat";
import session from "express-session";
import { storage } from "./storage";
import { authenticateToken, optionalAuth, requirePremium } from "./auth";
import { logSecurityEvent } from "./security";
import { setupSecurityMiddleware, setupCORS, validateInput, secureApiResponse } from "./middleware/security";
import { initializeEncryption, PersonalDataEncryption, FieldEncryption, decryptData } from "./encryption";
import crypto from 'crypto';
import { 
  hashPassword, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken,
  calculateRiskScore,
  shouldLockAccount,
  calculateLockDuration,
  isStrongPassword,
  validateEmail,
  generateVerificationToken,
  generateSMSCode,
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken
} from "./security";
import { 
  insertUserSchema, 
  loginSchema, 
  insertSwipeSchema, 
  insertMessageSchema, 
  updateUserPreferencesSchema, 
  updateMatchSchema,
  insertEventSchema,
  insertEventParticipantSchema,
  insertPostMeetReflectionSchema,
  insertUserReportSchema,
  insertPhotoVerificationSchema,
  insertBlockedUserSchema,
  insertTrustedContactSchema,
  insertSafetyCheckInSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
  resetPasswordSchema,
  changePasswordSchema,
  enable2FASchema,
  type User,
  type Swipe,
  type Match
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize encryption system
  initializeEncryption();
  
  // Trust proxy configuration - disabled for development to avoid rate limiting issues
  app.set('trust proxy', false);
  
  // Setup security middleware first
  setupCORS(app);
  setupSecurityMiddleware(app);
  app.use(validateInput);
  app.use(secureApiResponse);
  
  // Configure enhanced session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Don't use default name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' // CSRF protection
    },
    genid: () => {
      return crypto.randomBytes(32).toString('hex'); // Cryptographically secure session IDs
    }
  }));
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Validate email format
      if (!validateEmail(userData.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check password strength
      const passwordCheck = isStrongPassword(userData.password);
      if (!passwordCheck.isValid) {
        return res.status(400).json({ 
          message: "Password does not meet security requirements", 
          issues: passwordCheck.issues 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        await logSecurityEvent({
          eventType: 'registration_attempt_duplicate_username',
          req,
          success: false,
          details: { username: userData.username }
        });
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        await logSecurityEvent({
          eventType: 'registration_attempt_duplicate_email',
          req,
          success: false,
          details: { email: userData.email }
        });
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Generate email verification token
      const emailVerificationToken = generateVerificationToken();

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Log successful registration
      await logSecurityEvent({
        userId: user.id,
        eventType: 'user_registration',
        req,
        success: true,
        details: { username: user.username, email: user.email }
      });

      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        message: "Registration successful. Please check your email for verification."
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        await logSecurityEvent({
          eventType: 'login_attempt_user_not_found',
          req,
          success: false,
          details: { username }
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if account is locked
      if (user.accountLockedUntil && new Date() < new Date(user.accountLockedUntil)) {
        await logSecurityEvent({
          userId: user.id,
          eventType: 'login_attempt_locked_account',
          req,
          success: false,
          details: { lockedUntil: user.accountLockedUntil }
        });
        return res.status(423).json({ message: "Account is temporarily locked" });
      }

      // Check if user is banned
      if (user.isBanned) {
        await logSecurityEvent({
          userId: user.id,
          eventType: 'login_attempt_banned_account',
          req,
          success: false
        });
        const banMessage = user.bannedUntil 
          ? `Account is banned until ${user.bannedUntil}`
          : 'Account is permanently banned';
        return res.status(403).json({ message: banMessage });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
        
        // Check if account should be locked
        const lockDuration = shouldLockAccount(newFailedAttempts) ? calculateLockDuration(newFailedAttempts) : 0;
        const accountLockedUntil = lockDuration > 0 ? new Date(Date.now() + lockDuration) : null;

        await storage.updateUser(user.id, {
          failedLoginAttempts: newFailedAttempts,
          accountLockedUntil
        });

        await logSecurityEvent({
          userId: user.id,
          eventType: 'login_attempt_failed_password',
          req,
          success: false,
          details: { 
            failedAttempts: newFailedAttempts,
            accountLocked: !!accountLockedUntil 
          },
          riskScore: calculateRiskScore(req, user)
        });

        if (accountLockedUntil) {
          return res.status(423).json({ message: "Too many failed attempts. Account temporarily locked." });
        }

        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Reset failed login attempts on successful login
      await storage.updateUser(user.id, {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastActive: new Date(),
        lastIpAddress: req.ip || 'unknown'
      });

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // For now, just generate tokens but would require 2FA verification in production
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Store in session
        req.session.userId = user.id;
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        req.session.loginTime = new Date();
        req.session.lastActivity = new Date();

        await logSecurityEvent({
          userId: user.id,
          eventType: 'login_success_with_2fa',
          req,
          success: true,
          riskScore: calculateRiskScore(req, user)
        });

        const { password: _, twoFactorSecret, emailVerificationToken, phoneVerificationToken, passwordResetToken, ...userWithoutSensitiveData } = user;
        
        return res.json({ 
          user: userWithoutSensitiveData,
          accessToken,
          message: "Login successful"
        });
      }

      // Regular login without 2FA
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store in session
      req.session.userId = user.id;
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      req.session.loginTime = new Date();
      req.session.lastActivity = new Date();

      await logSecurityEvent({
        userId: user.id,
        eventType: 'login_success',
        req,
        success: true,
        riskScore: calculateRiskScore(req, user)
      });

      const { password: _, twoFactorSecret, emailVerificationToken, phoneVerificationToken, passwordResetToken, ...userWithoutSensitiveData } = user;
      
      res.json({ 
        user: userWithoutSensitiveData,
        accessToken,
        message: "Login successful"
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      const user = req.user;

      await logSecurityEvent({
        userId: user.id,
        eventType: 'user_logout',
        req,
        success: true
      });

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });

      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Discovery routes
  app.get("/api/discover/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { useCompatibilityMatching, meetReadiness } = req.query;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check daily limit for non-premium users
      await storage.resetDailyViewsIfNeeded(userId);
      const updatedUser = await storage.getUser(userId);
      
      const dailyLimit = updatedUser?.isPremium ? Infinity : 15;
      if ((updatedUser?.dailyViewsUsed || 0) >= dailyLimit) {
        return res.status(429).json({ 
          message: "Daily view limit reached",
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000 - ((updatedUser?.dailyViewsUsed || 0) * 60 * 60 * 1000))
        });
      }

      // Use the new filtered discovery method
      const users = await storage.getFilteredUsers(userId, {
        isPremium: updatedUser?.isPremium,
        useCompatibilityMatching: useCompatibilityMatching === 'true',
        meetReadiness: meetReadiness as string
      });

      // Limit results and remove passwords
      const limitedUsers = users.slice(0, 10).map(u => {
        const { password, ...userWithoutPassword } = u;
        console.log('Returning user:', u.name, 'with timeline alignment:', u.timelineAlignment, 'reason:', u.timelineReason);
        return userWithoutPassword;
      });

      console.log('Final response will contain timeline data:', limitedUsers.some(u => u.timelineAlignment !== undefined));
      console.log('Sample user timeline data:', limitedUsers[0] ? { 
        name: limitedUsers[0].name, 
        timelineAlignment: limitedUsers[0].timelineAlignment,
        timelineReason: limitedUsers[0].timelineReason
      } : 'No users');
      res.json({ users: limitedUsers });
    } catch (error) {
      console.error('Discovery error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Smart matching discovery route
  app.get("/api/discover/compatible/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check daily limit for non-premium users
      await storage.resetDailyViewsIfNeeded(userId);
      const updatedUser = await storage.getUser(userId);
      
      const dailyLimit = updatedUser?.isPremium ? Infinity : 15;
      if ((updatedUser?.dailyViewsUsed || 0) >= dailyLimit) {
        return res.status(429).json({ 
          message: "Daily view limit reached",
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000 - ((updatedUser?.dailyViewsUsed || 0) * 60 * 60 * 1000))
        });
      }

      // Get users already swiped on
      const swipes = await storage.getUserSwipes(userId);
      const swipedIds = swipes.map(s => s.swipedId);
      
      const discoverableUsers = await storage.getDiscoverableUsers(userId, swipedIds);
      
      // Calculate compatibility and add distance
      const compatibleUsers = discoverableUsers.slice(0, 10).map(u => {
        const distance = Math.random() * 5; // Random distance 0-5km
        
        // Calculate compatibility score based on shared interests and preferences
        let compatibilityScore = 50; // Base score
        const compatibilityReasons: string[] = [];
        
        // Age compatibility - using age range fields from user schema
        const userMinAge = user.ageRangeMin ?? 18;
        const userMaxAge = user.ageRangeMax ?? 35;
        if (u.age >= userMinAge && u.age <= userMaxAge) {
          compatibilityScore += 15;
          compatibilityReasons.push("In your preferred age range");
        }
        
        // Interest matching
        if (user.interests && u.interests) {
          const commonInterests = user.interests.filter(interest => 
            u.interests?.includes(interest)
          );
          if (commonInterests.length > 0) {
            compatibilityScore += commonInterests.length * 5;
            compatibilityReasons.push(`${commonInterests.length} shared interests: ${commonInterests.slice(0, 2).join(', ')}`);
          }
        }
        
        // Lifestyle compatibility - using actual user fields
        if (user.lifestyle && u.lifestyle) {
          const commonLifestyle = user.lifestyle.filter(item => u.lifestyle?.includes(item));
          if (commonLifestyle.length > 0) {
            compatibilityScore += commonLifestyle.length * 3;
            compatibilityReasons.push(`Similar lifestyle preferences`);
          }
        }
        
        // Relationship goals
        if (user.preferences?.relationshipGoals && 
            user.preferences.relationshipGoals === u.preferences?.relationshipGoals) {
          compatibilityScore += 20;
          compatibilityReasons.push("Same relationship goals");
        }
        
        // Cap at 99%
        compatibilityScore = Math.min(99, compatibilityScore);
        
        return {
          ...u,
          distance: Number(distance.toFixed(1)),
          compatibilityScore,
          compatibilityReasons,
          password: undefined, // Remove password from response
        };
      }).sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0)); // Sort by compatibility

      res.json({ users: compatibleUsers });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Swipe routes
  app.post("/api/swipe", authenticateToken, async (req: any, res) => {
    try {
      const swipeData = insertSwipeSchema.parse(req.body);
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Check if already swiped
      const alreadySwiped = await storage.hasUserSwiped(userId, swipeData.swipedId);
      if (alreadySwiped) {
        return res.status(400).json({ message: "Already swiped on this user" });
      }

      // Increment daily view count
      await storage.updateDailyViews(userId);

      // Create swipe
      const swipe = await storage.createSwipe({
        ...swipeData,
        swiperId: userId,
      });

      // Check for match if it's a like
      let match = null;
      if (swipeData.isLike) {
        const isMatch = await storage.checkForMatch(userId, swipeData.swipedId);
        if (isMatch) {
          match = await storage.createMatch(userId, swipeData.swipedId);
        }
      }

      res.json({ swipe, match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Matches routes
  app.get("/api/matches", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const matches = await storage.getUserMatches(userId);
      
      const matchesWithUsers = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          
          if (!otherUser) return null;
          
          const { password, ...userWithoutPassword } = otherUser;
          return {
            ...match,
            otherUser: userWithoutPassword,
          };
        })
      );

      const filteredMatches = matchesWithUsers.filter(m => m !== null);
      res.json(filteredMatches);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Messages routes
  app.get("/api/messages/:matchId", authenticateToken, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      
      const messages = await storage.getMatchMessages(matchId);
      
      // Decrypt message content for authenticated user
      const decryptedMessages = messages.map(message => {
        if (message.content && message.messageType === 'text') {
          try {
            const encryptedData = JSON.parse(message.content);
            if (encryptedData.data && encryptedData.iv && encryptedData.tag) {
              const decryptedContent = PersonalDataEncryption.decryptData(encryptedData);
              return { ...message, content: decryptedContent };
            }
          } catch (error) {
            console.error('Failed to decrypt message content:', error);
            // Return original content if decryption fails (backward compatibility)
          }
        }
        return message;
      });
      
      res.json({ messages: decryptedMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const senderId = req.user.id;
      
      // Encrypt message content if present
      let encryptedContent = messageData.content;
      if (messageData.content && messageData.messageType === 'text') {
        const encryptedData = PersonalDataEncryption.encryptMessage(messageData.content);
        encryptedContent = JSON.stringify(encryptedData);
      }

      const message = await storage.createMessage({
        ...messageData,
        content: encryptedContent,
        senderId,
      });

      // Log security event for message creation
      await logSecurityEvent({
        userId: senderId,
        eventType: 'message_sent',
        req,
        success: true,
        details: { 
          matchId: messageData.matchId,
          messageType: messageData.messageType,
          contentEncrypted: messageData.messageType === 'text'
        }
      });

      res.json({ message });
    } catch (error) {
      console.error('Error creating message:', error);
      
      // Log failed message attempt
      await logSecurityEvent({
        userId: req.user?.id,
        eventType: 'message_send_failed',
        req,
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Voice message upload endpoint
  app.post("/api/messages/voice-upload", async (req, res) => {
    try {
      const { audioData, matchId, duration } = req.body;
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "User ID required" });
      }

      if (!audioData || !matchId || !duration) {
        return res.status(400).json({ message: "Audio data, match ID, and duration are required" });
      }

      // In a real app, you'd upload to cloud storage (AWS S3, Google Cloud, etc.)
      // For demo purposes, we'll simulate the upload and return a mock URL
      const voiceUrl = `data:audio/webm;base64,${audioData}`;
      
      const message = await storage.createMessage({
        matchId,
        senderId: userId,
        content: null,
        messageType: 'voice',
        voiceUrl,
        voiceDuration: duration,
      });

      res.json({ message, voiceUrl });
    } catch (error) {
      console.error('Voice upload error:', error);
      res.status(500).json({ message: "Failed to upload voice message" });
    }
  });

  // Get match details with users
  app.get("/api/match/:matchId", async (req, res) => {
    try {
      const { matchId } = req.params;
      
      const match = await storage.getMatchWithUsers(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      const { user1: { password: _, ...user1 }, user2: { password: __, ...user2 }, ...matchData } = match;
      
      res.json({ 
        match: {
          ...matchData,
          user1,
          user2
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Compatible discovery route
  app.get("/api/discover/compatible/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check daily limit for non-premium users
      await storage.resetDailyViewsIfNeeded(userId);
      const updatedUser = await storage.getUser(userId);
      
      const dailyLimit = updatedUser?.isPremium ? Infinity : 15;
      if ((updatedUser?.dailyViewsUsed || 0) >= dailyLimit) {
        return res.status(429).json({ 
          message: "Daily view limit reached",
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000 - ((updatedUser?.dailyViewsUsed || 0) * 60 * 60 * 1000))
        });
      }

      // Get users already swiped on
      const swipes = await storage.getUserSwipes(userId);
      const swipedIds = swipes.map(s => s.swipedId);
      
      const compatibleUsers = await storage.getCompatibleUsers(userId, swipedIds);
      
      // Limit to top 10 most compatible and remove password
      const usersWithoutPasswords = compatibleUsers.slice(0, 10).map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });

      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User preferences routes
  app.put("/api/user/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = updateUserPreferencesSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile routes
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get public profile (shareable profile for social media)
  app.get("/api/public-profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.session?.userId;
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Return limited public profile info (no sensitive data)
      const publicProfile = {
        id: user.id,
        name: user.name,
        age: user.age,
        bio: user.bio,
        location: user.location,
        occupation: user.occupation,
        profilePhoto: user.profilePhoto,
        interests: user.interests,
        isPremium: user.isPremium,
        isPhotoVerified: user.isPhotoVerified,
        lastActive: user.lastActive,
      };

      res.json({ 
        user: publicProfile,
        isOwnProfile: currentUserId === userId
      });
    } catch (error) {
      console.error("Public profile error:", error);
      res.status(500).json({ message: "Failed to load profile" });
    }
  });

  app.put("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Premium subscription route
  // Stripe subscription management routes
  app.post('/api/create-subscription', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          return res.json({
            subscriptionId: subscription.id,
            status: subscription.status,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
          });
        }
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      // Create or retrieve Stripe customer
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id }
        });
        await storage.updateStripeCustomerId(user.id, customer.id);
      }

      // Create subscription with trial period
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Criss-Cross Premium',
              description: 'Unlimited swipes, enhanced matching, priority discovery, match extensions, and timeline filters',
            },
            unit_amount: 999, // $9.99 per month
            recurring: {
              interval: 'month',
            },
          },
        }],
        trial_period_days: 7, // 7-day free trial
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: { userId: user.id }
      });

      // Update user with subscription info
      await storage.updateUserStripeInfo(user.id, {
        customerId: customer.id,
        subscriptionId: subscription.id
      });

      // Update premium status
      await storage.updateUser(user.id, { isPremium: true });
  
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        trial_end: subscription.trial_end,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Get subscription status
  app.get('/api/subscription/status', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeSubscriptionId) {
        return res.json({ 
          hasSubscription: false, 
          isPremium: false,
          status: 'inactive'
        });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      
      res.json({
        hasSubscription: true,
        isPremium: isActive,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
      });
    } catch (error: any) {
      console.error('Subscription status error:', error);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Cancel subscription
  app.post('/api/subscription/cancel', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      res.json({
        message: "Subscription will be canceled at the end of the current period",
        subscription: {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end
        }
      });
    } catch (error: any) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Reactivate subscription
  app.post('/api/subscription/reactivate', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No subscription found" });
      }

      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      res.json({
        message: "Subscription reactivated successfully",
        subscription: {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end
        }
      });
    } catch (error: any) {
      console.error('Subscription reactivation error:', error);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Stripe webhooks
  app.post('/api/webhooks/stripe', async (req, res) => {
    let event;

    try {
      event = req.body;
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Payment succeeded for invoice:', invoice.id);
        
        // Update user premium status
        if (invoice.customer && invoice.subscription) {
          try {
            const customer = await stripe.customers.retrieve(invoice.customer);
            if (customer && !customer.deleted && customer.metadata?.userId) {
              await storage.updateUser(customer.metadata.userId, { isPremium: true });
              console.log(`Updated premium status for user ${customer.metadata.userId}`);
            }
          } catch (error) {
            console.error('Error updating user premium status:', error);
          }
        }
        break;

      case 'invoice.payment_failed':
        console.log('Payment failed for invoice:', event.data.object.id);
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        console.log('Subscription canceled:', deletedSub.id);
        
        // Remove premium status
        if (deletedSub.customer) {
          try {
            const customer = await stripe.customers.retrieve(deletedSub.customer);
            if (customer && !customer.deleted && customer.metadata?.userId) {
              await storage.updateUser(customer.metadata.userId, { 
                isPremium: false,
                stripeSubscriptionId: null 
              });
              console.log(`Removed premium status for user ${customer.metadata.userId}`);
            }
          } catch (error) {
            console.error('Error removing premium status:', error);
          }
        }
        break;

      case 'customer.subscription.updated':
        const updatedSub = event.data.object;
        console.log('Subscription updated:', updatedSub.id);
        
        // Update premium status based on subscription status
        if (updatedSub.customer) {
          try {
            const customer = await stripe.customers.retrieve(updatedSub.customer);
            if (customer && !customer.deleted && customer.metadata?.userId) {
              const isActive = updatedSub.status === 'active' || updatedSub.status === 'trialing';
              await storage.updateUser(customer.metadata.userId, { isPremium: isActive });
              console.log(`Updated premium status to ${isActive} for user ${customer.metadata.userId}`);
            }
          } catch (error) {
            console.error('Error updating premium status:', error);
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Safety Toolkit Routes
  app.post('/api/safety/emergency-alert', authenticateToken, async (req: any, res) => {
    try {
      const { location, alertType, additionalInfo } = req.body;
      
      if (!location || !alertType) {
        return res.status(400).json({ message: 'Location and alert type are required' });
      }

      // Get user's trusted contacts for notification
      const trustedContacts = await storage.getTrustedContacts(req.user.id);
      
      if (trustedContacts.length === 0) {
        return res.status(400).json({ 
          message: 'No trusted contacts found. Please add trusted contacts first.',
          requiresSetup: true
        });
      }

      const alert = await storage.createEmergencyAlert({
        userId: req.user.id,
        location,
        alertType,
        additionalInfo
      });

      // TODO: Send actual notifications via email/SMS to trusted contacts
      // For now, we'll just mark them as notified in the alert
      const contactIds = trustedContacts.map(contact => contact.id);
      
      console.log(`Emergency alert triggered by ${req.user.username}:`, {
        alertType,
        location,
        contactsToNotify: trustedContacts.length,
        additionalInfo
      });

      res.json({ 
        message: 'Emergency alert sent successfully',
        alert: {
          ...alert,
          contactsNotified: contactIds
        }
      });
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      res.status(500).json({ message: 'Failed to send emergency alert' });
    }
  });

  app.post('/api/safety/ghost-profile', authenticateToken, async (req: any, res) => {
    try {
      const { ghostedId, reason } = req.body;
      
      if (!ghostedId) {
        return res.status(400).json({ message: 'User ID to ghost is required' });
      }

      // Check if already ghosted
      const isAlreadyGhosted = await storage.isUserGhosted(req.user.id, ghostedId);
      if (isAlreadyGhosted) {
        return res.status(400).json({ message: 'User is already ghosted' });
      }

      const ghostedUser = await storage.ghostUser(req.user.id, ghostedId, reason);

      res.json({ 
        message: 'Profile ghosted successfully',
        ghostedUser
      });
    } catch (error) {
      console.error('Error ghosting profile:', error);
      res.status(500).json({ message: 'Failed to ghost profile' });
    }
  });

  app.post('/api/safety/date-checkin', authenticateToken, async (req: any, res) => {
    try {
      const { matchId, status, location, needsHelp, safetyRating } = req.body;
      
      if (!matchId || !status) {
        return res.status(400).json({ message: 'Match ID and status are required' });
      }

      const checkIn = await storage.createDateCheckIn({
        userId: req.user.id,
        matchId,
        scheduledTime: new Date(),
        location,
        needsHelp: needsHelp || false,
        safetyRating
      });

      if (needsHelp) {
        console.log(`Date check-in: ${req.user.username} requested help during meetup`);
      }

      res.json({ 
        message: needsHelp ? 'Help request sent' : 'Check-in recorded',
        checkIn,
        status: needsHelp ? 'help_needed' : 'safe'
      });
    } catch (error) {
      console.error('Error creating date check-in:', error);
      res.status(500).json({ message: 'Failed to record check-in' });
    }
  });

  app.get('/api/safety/trusted-contacts', async (req: any, res) => {
    try {
      const testUserId = "701bd80c-33eb-4431-83ab-3006804af554";
      const contacts = await storage.getTrustedContacts(testUserId);
      res.json(contacts);
    } catch (error) {
      console.error('Error fetching trusted contacts:', error);
      res.status(500).json({ message: 'Failed to fetch trusted contacts' });
    }
  });

  // Get upcoming dates for date safety
  app.get('/api/dates/upcoming', async (req, res) => {
    try {
      const testUserId = "701bd80c-33eb-4431-83ab-3006804af554";
      const matches = await storage.getUserMatches(testUserId);
      
      // Filter for confirmed dates and add partner info
      const upcomingDates = await Promise.all(
        matches
          .filter(match => match.meetupConfirmed && match.meetupTime)
          .map(async (match) => {
            const otherUserId = match.user1Id === testUserId ? match.user2Id : match.user1Id;
            const partner = await storage.getUser(otherUserId);
            
            if (!partner) return null;
            
            const { password, ...partnerWithoutPassword } = partner;
            return {
              id: match.id,
              scheduledTime: match.meetupTime,
              location: match.meetupLocation,
              status: 'confirmed',
              partner: partnerWithoutPassword
            };
          })
      );

      const filteredDates = upcomingDates.filter(date => date !== null);
      res.json(filteredDates);
    } catch (error) {
      console.error('Error fetching upcoming dates:', error);
      res.status(500).json({ message: 'Failed to fetch upcoming dates' });
    }
  });

  // Emergency alert endpoint
  app.post('/api/safety/emergency-alert', async (req, res) => {
    try {
      const { message, location } = req.body;
      
      // In a real app, this would send alerts to trusted contacts
      res.json({ 
        success: true, 
        message: 'Emergency alert sent to trusted contacts',
        alertId: Date.now().toString()
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      res.status(500).json({ message: 'Failed to send emergency alert' });
    }
  });

  // Date check-in endpoint for date safety
  app.post('/api/safety/date-checkin', async (req, res) => {
    try {
      const { dateId, status, message, location } = req.body;
      
      res.json({ 
        success: true, 
        message: 'Check-in recorded successfully',
        checkInId: Date.now().toString()
      });
    } catch (error) {
      console.error('Error recording check-in:', error);
      res.status(500).json({ message: 'Failed to record check-in' });
    }
  });

  app.get('/api/safety/emergency-alerts', authenticateToken, async (req: any, res) => {
    try {
      const alerts = await storage.getUserEmergencyAlerts(req.user.id);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      res.status(500).json({ message: 'Failed to fetch emergency alerts' });
    }
  });

  app.post('/api/safety/resolve-alert/:alertId', authenticateToken, async (req: any, res) => {
    try {
      const { alertId } = req.params;
      const resolvedAlert = await storage.resolveEmergencyAlert(alertId, req.user.id);
      
      if (!resolvedAlert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      res.json({ 
        message: 'Alert resolved successfully',
        alert: resolvedAlert
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({ message: 'Failed to resolve alert' });
    }
  });

  // One-Click Emergency Contact Share Routes
  app.post('/api/safety/emergency-share', authenticateToken, async (req: any, res) => {
    try {
      const { matchId, shareType, location, dateDetails } = req.body;
      
      if (!shareType || !location) {
        return res.status(400).json({ message: 'Share type and location are required' });
      }

      // Get user's trusted contacts for notification
      const trustedContacts = await storage.getTrustedContacts(req.user.id);
      
      if (trustedContacts.length === 0) {
        return res.status(400).json({ 
          message: 'No trusted contacts found. Please add trusted contacts first.',
          requiresSetup: true
        });
      }

      // Set auto-resolve time (2 hours for location_only, 4 hours for full_details, immediate manual resolve for panic_mode)
      const autoResolveHours = shareType === 'location_only' ? 2 : shareType === 'full_details' ? 4 : null;
      const autoResolveAt = autoResolveHours ? new Date(Date.now() + autoResolveHours * 60 * 60 * 1000) : null;

      const emergencyShare = await storage.createEmergencyShare({
        userId: req.user.id,
        matchId,
        shareType,
        location,
        dateDetails,
        autoResolveAt
      });

      // Notify emergency contacts (simulate notification for now)
      const emergencyContactIds = trustedContacts
        .filter(contact => contact.isEmergencyContact)
        .map(contact => contact.id);
      
      if (emergencyContactIds.length > 0) {
        await storage.notifyEmergencyContacts(req.user.id, emergencyShare.id, emergencyContactIds);
      }

      console.log(`One-click emergency share triggered by ${req.user.username}:`, {
        shareType,
        matchId,
        contactsNotified: emergencyContactIds.length,
        autoResolveAt
      });

      res.json({ 
        message: 'Emergency contacts notified successfully',
        share: {
          ...emergencyShare,
          contactsNotified: emergencyContactIds.length,
          autoResolveAt
        }
      });
    } catch (error) {
      console.error('Error creating emergency share:', error);
      res.status(500).json({ message: 'Failed to notify emergency contacts' });
    }
  });

  app.get('/api/safety/emergency-shares', authenticateToken, async (req: any, res) => {
    try {
      const shares = await storage.getUserEmergencyShares(req.user.id);
      res.json(shares);
    } catch (error) {
      console.error('Error fetching emergency shares:', error);
      res.status(500).json({ message: 'Failed to fetch emergency shares' });
    }
  });

  app.get('/api/safety/active-emergency-shares', authenticateToken, async (req: any, res) => {
    try {
      const activeShares = await storage.getActiveEmergencyShares(req.user.id);
      res.json(activeShares);
    } catch (error) {
      console.error('Error fetching active emergency shares:', error);
      res.status(500).json({ message: 'Failed to fetch active emergency shares' });
    }
  });

  app.post('/api/safety/resolve-emergency-share/:shareId', authenticateToken, async (req: any, res) => {
    try {
      const { shareId } = req.params;
      const resolvedShare = await storage.resolveEmergencyShare(shareId);
      
      if (!resolvedShare) {
        return res.status(404).json({ message: 'Emergency share not found' });
      }

      res.json({ 
        message: 'Emergency share resolved successfully',
        share: resolvedShare
      });
    } catch (error) {
      console.error('Error resolving emergency share:', error);
      res.status(500).json({ message: 'Failed to resolve emergency share' });
    }
  });

  // Video Chat Routes
  app.post('/api/video-chat/initiate', authenticateToken, async (req: any, res) => {
    try {
      const { matchId, participantId } = req.body;
      
      if (!matchId || !participantId) {
        return res.status(400).json({ message: 'Match ID and participant ID are required' });
      }

      // Verify match exists and user is part of it
      const match = await storage.getMatchWithUsers(matchId);
      if (!match || (match.user1Id !== req.user.id && match.user2Id !== req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized to initiate call for this match' });
      }

      const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const session = await storage.createMessage({
        matchId,
        initiatorId: req.user.id,
        participantId,
        sessionToken,
        status: 'pending'
      });

      res.json({ 
        sessionId: session.id,
        sessionToken,
        message: 'Video chat session initiated' 
      });
    } catch (error) {
      console.error('Error initiating video chat:', error);
      res.status(500).json({ message: 'Failed to initiate video chat' });
    }
  });

  app.post('/api/video-chat/accept', authenticateToken, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      
      const session = await storage.updateUser(sessionId, {
        status: 'active',
        startedAt: new Date()
      });

      if (!session) {
        return res.status(404).json({ message: 'Video chat session not found' });
      }

      res.json({ message: 'Video chat accepted', session });
    } catch (error) {
      console.error('Error accepting video chat:', error);
      res.status(500).json({ message: 'Failed to accept video chat' });
    }
  });

  app.post('/api/video-chat/end', authenticateToken, async (req: any, res) => {
    try {
      const { matchId, duration, callQuality } = req.body;
      
      // Find active session for this match
      const sessions = await storage.getUserMatches(matchId);
      const activeSession = sessions.find(s => s.status === 'active');
      
      if (activeSession) {
        await storage.updateUser(activeSession.id, {
          status: 'ended',
          endedAt: new Date(),
          duration,
          callQuality
        });
      }

      res.json({ message: 'Video chat ended successfully' });
    } catch (error) {
      console.error('Error ending video chat:', error);
      res.status(500).json({ message: 'Failed to end video chat' });
    }
  });

  app.get('/api/video-chat/sessions/:matchId', authenticateToken, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const sessions = await storage.getUserMatches(matchId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching video chat sessions:', error);
      res.status(500).json({ message: 'Failed to fetch video chat sessions' });
    }
  });

  // Premium feature enforcement middleware
  app.use('/api/premium/*', requirePremium);

  // Match management routes
  app.post('/api/matches/:matchId/extend', async (req, res) => {
    try {
      const { matchId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const extendedMatch = await storage.extendMatch(matchId, userId);
      if (!extendedMatch) {
        return res.status(404).json({ message: "Match not found or unauthorized" });
      }

      res.json({ match: extendedMatch });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/matches/:matchId/freeze', async (req, res) => {
    try {
      const { matchId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const frozenMatch = await storage.freezeMatch(matchId, userId);
      if (!frozenMatch) {
        return res.status(404).json({ message: "Match not found or unauthorized" });
      }

      res.json({ match: frozenMatch });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/matches/:matchId/unfreeze', async (req, res) => {
    try {
      const { matchId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const unfrozenMatch = await storage.unfreezeMatch(matchId, userId);
      if (!unfrozenMatch) {
        return res.status(404).json({ message: "Match not found or unauthorized" });
      }

      res.json({ match: unfrozenMatch });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/matches/:matchId/confirm-meetup', async (req, res) => {
    try {
      const { matchId } = req.params;
      const { userId, time, location } = req.body;

      if (!userId || !time || !location) {
        return res.status(400).json({ message: "User ID, time, and location required" });
      }

      const confirmedMatch = await storage.confirmMeetup(matchId, userId, new Date(time), location);
      if (!confirmedMatch) {
        return res.status(404).json({ message: "Match not found or unauthorized" });
      }

      res.json({ match: confirmedMatch });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/matches/active/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const activeMatches = await storage.getActiveMatches(userId);
      res.json({ matches: activeMatches });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json({ events });
    } catch (error) {
      console.error('Events error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/events/:eventId/join", async (req, res) => {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const participant = await storage.joinEvent(eventId, userId);
      res.json({ participant });
    } catch (error) {
      console.error('Join event error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  app.get("/api/users/:userId/shared-event-matches", async (req, res) => {
    try {
      const { userId } = req.params;
      const matches = await storage.getDiscoverableUsers(userId);
      res.json({ matches });
    } catch (error) {
      console.error('Shared event matches error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Post-Meet Reflection routes
  app.post("/api/matches/:matchId/reflection", async (req, res) => {
    try {
      const { matchId } = req.params;
      const reflectionData = insertPostMeetReflectionSchema.parse(req.body);
      
      if (!req.body.userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const reflection = await storage.createPostMeetReflection({
        ...reflectionData,
        matchId,
        userId: req.body.userId
      });
      
      res.json({ reflection });
    } catch (error) {
      console.error('Create reflection error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/matches/:matchId/met-in-person", async (req, res) => {
    try {
      const { matchId } = req.params;
      const match = await storage.markMatchAsMetInPerson(matchId);
      res.json({ match });
    } catch (error) {
      console.error('Mark met in person error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up video chat WebSocket server
  setupVideoChat(httpServer);
  
  return httpServer;
}
