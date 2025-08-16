import { 
  type User, type InsertUser, 
  type Swipe, type InsertSwipe, 
  type Match, type InsertMatch, type UpdateMatch,
  type Message, type InsertMessage,
  type UpdateUserPreferences,
  type UserWithCompatibility,
  type Event, type InsertEvent,
  type EventParticipant, type InsertEventParticipant,
  type PostMeetReflection, type InsertPostMeetReflection,
  type UserReport, type InsertUserReport,
  type SecurityLog, type InsertSecurityLog,
  type PhotoVerification, type InsertPhotoVerification,
  type BlockedUser, type InsertBlockedUser,
  type TrustedContact, type InsertTrustedContact,
  type SafetyCheckIn, type InsertSafetyCheckIn,
  type EmergencyAlert, type InsertEmergencyAlert,
  type EmergencyShare, type InsertEmergencyShare,
  type GhostedUser, type InsertGhostedUser,
  type DateCheckIn, type InsertDateCheckIn,
  type VideoChatSession, type InsertVideoChatSession
} from "@shared/schema";
import { randomUUID } from "crypto";
import { FieldEncryption, PersonalDataEncryption, SecureDataDeletion } from "./encryption";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateDailyViews(userId: string): Promise<void>;
  resetDailyViewsIfNeeded(userId: string): Promise<void>;
  
  // Discovery
  getDiscoverableUsers(userId: string, excludeIds: string[]): Promise<User[]>;
  getCompatibleUsers(userId: string, excludeIds: string[]): Promise<UserWithCompatibility[]>;
  getFilteredUsers(userId: string, filters: {
    isPremium?: boolean;
    useCompatibilityMatching?: boolean;
    meetReadiness?: string;
  }): Promise<UserWithCompatibility[]>;
  updateUserPreferences(userId: string, preferences: UpdateUserPreferences): Promise<User | undefined>;
  
  // Swipes
  createSwipe(swipe: InsertSwipe & { swiperId: string }): Promise<Swipe>;
  getUserSwipes(userId: string): Promise<Swipe[]>;
  hasUserSwiped(swiperId: string, swipedId: string): Promise<boolean>;
  
  // Matches
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;
  checkForMatch(swiperId: string, swipedId: string): Promise<boolean>;
  
  // Messages
  createMessage(message: InsertMessage & { senderId: string }): Promise<Message>;
  getMatchMessages(matchId: string): Promise<Message[]>;
  getMatchWithUsers(matchId: string): Promise<(Match & { user1: User; user2: User }) | undefined>;
  
  // Stripe integration
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<User>;
  
  // Match management
  extendMatch(matchId: string, userId: string): Promise<Match | null>;
  freezeMatch(matchId: string, userId: string): Promise<Match | null>;
  unfreezeMatch(matchId: string, userId: string): Promise<Match | null>;
  confirmMeetup(matchId: string, userId: string, time: Date, location: string): Promise<Match | null>;
  getActiveMatches(userId: string): Promise<Match[]>;
  markMatchAsMetInPerson(matchId: string): Promise<Match | null>;
  
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getActiveEvents(): Promise<Event[]>;
  joinEvent(eventId: string, userId: string): Promise<EventParticipant>;
  leaveEvent(eventId: string, userId: string): Promise<boolean>;
  getEventParticipants(eventId: string): Promise<EventParticipant[]>;
  getUserEvents(userId: string): Promise<Event[]>;
  
  // Post-meet reflections
  createPostMeetReflection(reflection: InsertPostMeetReflection & { userId: string }): Promise<PostMeetReflection>;
  getMatchReflections(matchId: string): Promise<PostMeetReflection[]>;
  getUserReflections(userId: string): Promise<PostMeetReflection[]>;
  
  // Reporting
  createUserReport(report: InsertUserReport & { reporterId: string }): Promise<UserReport>;
  getUserReports(userId: string): Promise<UserReport[]>;
  
  // Security
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  getUserSecurityLogs(userId: string): Promise<SecurityLog[]>;
  
  // Photo verification
  createPhotoVerification(verification: InsertPhotoVerification & { userId: string }): Promise<PhotoVerification>;
  getUserPhotoVerification(userId: string): Promise<PhotoVerification | undefined>;
  approvePhotoVerification(verificationId: string): Promise<PhotoVerification | null>;
  rejectPhotoVerification(verificationId: string, reason: string): Promise<PhotoVerification | null>;
  
  // Blocking
  blockUser(blockerId: string, blockedId: string, reason?: string): Promise<BlockedUser>;
  unblockUser(blockerId: string, blockedId: string): Promise<boolean>;
  isUserBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  getBlockedUsers(userId: string): Promise<BlockedUser[]>;
  
  // Trusted contacts
  createTrustedContact(contact: InsertTrustedContact & { userId: string }): Promise<TrustedContact>;
  getTrustedContacts(userId: string): Promise<TrustedContact[]>;
  updateTrustedContact(contactId: string, updates: Partial<TrustedContact>): Promise<TrustedContact | null>;
  deleteTrustedContact(contactId: string): Promise<boolean>;
  
  // Safety check-ins
  createSafetyCheckIn(checkIn: InsertSafetyCheckIn & { userId: string }): Promise<SafetyCheckIn>;
  getUserSafetyCheckIns(userId: string): Promise<SafetyCheckIn[]>;
  getOverdueSafetyCheckIns(): Promise<SafetyCheckIn[]>;
  
  // Emergency alerts
  createEmergencyAlert(alert: InsertEmergencyAlert & { userId: string }): Promise<EmergencyAlert>;
  getUserEmergencyAlerts(userId: string): Promise<EmergencyAlert[]>;
  resolveEmergencyAlert(alertId: string, resolvedBy: string): Promise<EmergencyAlert | null>;
  ghostUser(ghosterId: string, ghostedId: string, reason?: string): Promise<GhostedUser>;
  isUserGhosted(ghosterId: string, ghostedId: string): Promise<boolean>;
  getGhostedUsers(userId: string): Promise<GhostedUser[]>;
  createDateCheckIn(checkIn: InsertDateCheckIn & { userId: string }): Promise<DateCheckIn>;
  getDateCheckIns(matchId: string): Promise<DateCheckIn[]>;
  getUserDateCheckIns(userId: string): Promise<DateCheckIn[]>;
  
  // Emergency contact share
  createEmergencyShare(share: InsertEmergencyShare & { userId: string }): Promise<EmergencyShare>;
  getUserEmergencyShares(userId: string): Promise<EmergencyShare[]>;
  resolveEmergencyShare(shareId: string): Promise<EmergencyShare | null>;
  getActiveEmergencyShares(userId: string): Promise<EmergencyShare[]>;
  notifyEmergencyContacts(userId: string, shareId: string, contactIds: string[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private swipes: Map<string, Swipe>;
  private matches: Map<string, Match>;
  private messages: Map<string, Message>;
  private events: Map<string, Event>;
  private eventParticipants: Map<string, EventParticipant>;
  private postMeetReflections: Map<string, PostMeetReflection>;
  private userReports: Map<string, UserReport>;
  private securityLogs: Map<string, SecurityLog>;
  private photoVerifications: Map<string, PhotoVerification>;
  private blockedUsers: Map<string, BlockedUser>;
  private trustedContacts: Map<string, TrustedContact>;
  private safetyCheckIns: Map<string, SafetyCheckIn>;
  private emergencyAlerts: Map<string, EmergencyAlert>;
  private emergencyShares: Map<string, EmergencyShare>;
  private ghostedUsers: Map<string, GhostedUser>;
  private dateCheckIns: Map<string, DateCheckIn>;

  constructor() {
    this.users = new Map();
    this.swipes = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.events = new Map();
    this.eventParticipants = new Map();
    this.postMeetReflections = new Map();
    this.userReports = new Map();
    this.securityLogs = new Map();
    this.photoVerifications = new Map();
    this.blockedUsers = new Map();
    this.trustedContacts = new Map();
    this.safetyCheckIns = new Map();
    this.emergencyAlerts = new Map();
    this.emergencyShares = new Map();
    this.ghostedUsers = new Map();
    this.dateCheckIns = new Map();
    
    // No mock data - users will be created through registration
  }

  // User management methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      bio: insertUser.bio || null,
      occupation: insertUser.occupation || null,
      location: insertUser.location || null,
      isPremium: false,
      profilePhoto: insertUser.profilePhoto || null,
      photos: insertUser.photos || [],
      interests: insertUser.interests || [],
      latitude: insertUser.latitude || null,
      longitude: insertUser.longitude || null,
      dailyViewsUsed: 0,
      lastViewReset: new Date(),
      lastActive: new Date(),
      ageRangeMin: insertUser.ageRangeMin || 18,
      ageRangeMax: insertUser.ageRangeMax || 35,
      maxDistance: insertUser.maxDistance || 25,
      dealBreakers: insertUser.dealBreakers || [],
      lookingFor: insertUser.lookingFor || "relationship",
      lifestyle: insertUser.lifestyle || [],
      values: insertUser.values || [],
      meetReadiness: insertUser.meetReadiness || "flexible",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      isEmailVerified: false,
      isPhoneVerified: false,
      isPhotoVerified: false,
      isIdVerified: false,
      phoneNumber: null,
      emailVerificationToken: null,
      phoneVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      lastPasswordChange: new Date(),
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      privacySettings: '{}',
      reportedCount: 0,
      isBanned: false,
      bannedUntil: null,
      accountCreatedAt: new Date(),
      lastIpAddress: null,
      deviceIds: [],
      loginHistory: '[]'
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateDailyViews(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const updatedUser = { 
      ...user, 
      dailyViewsUsed: (user.dailyViewsUsed || 0) + 1 
    };
    this.users.set(userId, updatedUser);
  }

  async resetDailyViewsIfNeeded(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const today = new Date().toDateString();
    const lastReset = new Date(user.lastViewReset || new Date()).toDateString();

    if (today !== lastReset) {
      const updatedUser = { 
        ...user, 
        dailyViewsUsed: 0, 
        lastViewReset: new Date() 
      };
      this.users.set(userId, updatedUser);
    }
  }

  async updateUserPreferences(userId: string, preferences: UpdateUserPreferences): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, ...preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Discovery methods
  async getDiscoverableUsers(userId: string, excludeIds: string[]): Promise<User[]> {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];
    
    const allExcludeIds = new Set([userId, ...excludeIds]);
    
    return Array.from(this.users.values())
      .filter(user => 
        !allExcludeIds.has(user.id) &&
        this.isGenderCompatible(currentUser, user)
      )
      .slice(0, 10); // Limit to 10 users
  }

  async getCompatibleUsers(userId: string, excludeIds: string[]): Promise<UserWithCompatibility[]> {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];
    
    const allExcludeIds = new Set([userId, ...excludeIds]);
    
    const compatibleUsers = Array.from(this.users.values())
      .filter(user => 
        !allExcludeIds.has(user.id) &&
        this.isGenderCompatible(currentUser, user)
      )
      .map(user => this.calculateCompatibility(currentUser, user))
      .filter(userWithCompat => (userWithCompat.compatibilityScore || 0) > 0)
      .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
      .slice(0, 10); // Limit to 10 users

    return compatibleUsers;
  }

  async getFilteredUsers(userId: string, filters: {
    isPremium?: boolean;
    useCompatibilityMatching?: boolean;
    meetReadiness?: string;
  }): Promise<UserWithCompatibility[]> {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];

    console.log(`Premium user timeline filtering for: ${filters.meetReadiness}`);

    // Get all compatible users first
    const swipedIds = Array.from(this.swipes.values())
      .filter(swipe => swipe.swiperId === userId)
      .map(swipe => swipe.swipedId);

    let users = await this.getCompatibleUsers(userId, swipedIds);

    // Apply premium timeline filtering
    if (filters.isPremium && filters.meetReadiness) {
      users = users.map(user => {
        const alignment = this.calculateTimelineAlignment(filters.meetReadiness!, user.meetReadiness || "flexible");
        console.log(`User ${user.name}: ${user.meetReadiness} -> alignment: ${alignment.score}, reason: ${alignment.reason}`);
        
        return {
          ...user,
          timelineAlignment: alignment.score,
          timelineReason: alignment.reason
        };
      }).sort((a, b) => (b.timelineAlignment || 0) - (a.timelineAlignment || 0));

      console.log(`Returning user: ${users[0]?.name} with timeline alignment: ${users[0]?.timelineAlignment} reason: ${users[0]?.timelineReason}`);
      
      users.forEach(user => {
        console.log(`Returning user: ${user.name} with timeline alignment: ${user.timelineAlignment} reason: ${user.timelineReason}`);
      });

      console.log(`Final response will contain timeline data: ${users.length > 0 && 'timelineAlignment' in users[0]}`);
      console.log(`Sample user timeline data:`, {
        name: users[0]?.name,
        timelineAlignment: users[0]?.timelineAlignment,
        timelineReason: users[0]?.timelineReason
      });
    }

    return users;
  }

  private calculateTimelineAlignment(userPref: string, otherUserPref: string): { score: number; reason: string } {
    const preferences: { [key: string]: number } = {
      'within_48h': 4,
      'this_weekend': 3,
      'after_coffee_chat': 2,
      'flexible': 1
    };

    const userScore = preferences[userPref] || 1;
    const otherScore = preferences[otherUserPref] || 1;
    
    if (userPref === otherUserPref) {
      return { 
        score: 100, 
        reason: `Both prefer ${userPref.replace(/_/g, ' ')}` 
      };
    }

    const scoreDiff = Math.abs(userScore - otherScore);
    const alignmentScore = Math.max(0, 100 - (scoreDiff * 20));
    
    const prefLabels: { [key: string]: string } = {
      'within_48h': 'within 48 hours',
      'this_weekend': 'this weekend',
      'after_coffee_chat': 'after coffee chat',
      'flexible': 'flexible timing'
    };

    return {
      score: alignmentScore,
      reason: `You prefer ${prefLabels[userPref]}, they prefer ${prefLabels[otherUserPref]}`
    };
  }

  private calculateCompatibility(user1: User, user2: User): UserWithCompatibility {
    let score = 0;
    const reasons: string[] = [];

    // Gender compatibility check (mandatory)
    if (!this.isGenderCompatible(user1, user2)) {
      return { ...user2, compatibilityScore: 0, compatibilityReasons: ["Not compatible"], distance: 999 };
    }

    // Age compatibility (25 points max)
    const user1AgeMin = user1.ageRangeMin ?? 18;
    const user1AgeMax = user1.ageRangeMax ?? 35;
    const user2AgeMin = user2.ageRangeMin ?? 18;
    const user2AgeMax = user2.ageRangeMax ?? 35;
    const user1MaxDist = user1.maxDistance ?? 25;
    const user2MaxDist = user2.maxDistance ?? 25;
    const user1DealBreakers = user1.dealBreakers ?? [];
    const user2DealBreakers = user2.dealBreakers ?? [];

    // Check age range compatibility
    if (user2.age >= user1AgeMin && user2.age <= user1AgeMax &&
        user1.age >= user2AgeMin && user1.age <= user2AgeMax) {
      score += 25;
      reasons.push("Age preferences match");
    } else if (user2.age < user1AgeMin || user2.age > user1AgeMax ||
               user1.age < user2AgeMin || user1.age > user2AgeMax) {
      score -= 15;
      reasons.push("Age preferences don't align");
    }

    // Distance compatibility (20 points max)
    const distance = this.calculateDistance(user1, user2);
    if (distance <= Math.min(user1MaxDist, user2MaxDist)) {
      const distanceScore = Math.max(0, 20 - distance);
      score += distanceScore;
      if (distance < 5) {
        reasons.push("Very close distance");
      } else if (distance < 15) {
        reasons.push("Good distance match");
      }
    }

    // Deal breaker check (can subtract points)
    const hasUserDealBreaker = user1DealBreakers.some(dealBreaker => 
      user2.lifestyle?.includes(dealBreaker) || 
      user2.values?.includes(dealBreaker) || 
      user2.interests?.includes(dealBreaker) ||
      user1.lifestyle?.includes(dealBreaker) || user1.values?.includes(dealBreaker)
    );
    if (hasUserDealBreaker) {
      score -= 30;
      reasons.push("Has deal breaker conflicts");
    }

    // Relationship goals compatibility (15 points max)
    if (user1.lookingFor === user2.lookingFor) {
      score += 15;
      reasons.push("Same relationship goals");
    } else if ((user1.lookingFor === "casual" && user2.lookingFor === "friendship") ||
               (user1.lookingFor === "friendship" && user2.lookingFor === "casual")) {
      score += 8;
      reasons.push("Compatible casual goals");
    }

    // Shared interests (20 points max)
    const sharedInterests = user1.interests?.filter(interest => 
      user2.interests?.includes(interest)
    ) || [];
    const interestScore = Math.min(20, sharedInterests.length * 4);
    score += interestScore;
    if (sharedInterests.length > 0) {
      reasons.push(`${sharedInterests.length} shared interests: ${sharedInterests.slice(0, 3).join(", ")}`);
    }

    // Lifestyle compatibility (15 points max)
    const sharedLifestyle = user1.lifestyle?.filter(style => 
      user2.lifestyle?.includes(style)
    ) || [];
    const lifestyleScore = Math.min(15, sharedLifestyle.length * 5);
    score += lifestyleScore;
    if (sharedLifestyle.length > 0) {
      reasons.push(`Compatible lifestyle: ${sharedLifestyle.join(", ")}`);
    }

    // Values alignment (15 points max)
    const sharedValues = user1.values?.filter(value => 
      user2.values?.includes(value)
    ) || [];
    const valuesScore = Math.min(15, sharedValues.length * 5);
    score += valuesScore;
    if (sharedValues.length > 0) {
      reasons.push(`Shared values: ${sharedValues.join(", ")}`);
    }

    return {
      ...user2,
      compatibilityScore: Math.round(score),
      compatibilityReasons: reasons,
      distance
    };
  }

  private calculateDistance(user1: User, user2: User): number {
    if (!user1.latitude || !user1.longitude || !user2.latitude || !user2.longitude) {
      return 999; // Return high distance if coordinates are missing
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(user2.latitude - user1.latitude);
    const dLon = this.toRadians(user2.longitude - user1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(user1.latitude)) * Math.cos(this.toRadians(user2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper function to check if two users are gender compatible
  private isGenderCompatible(user1: User, user2: User): boolean {
    // Check if user1 is interested in user2's gender
    const user1Interested = user1.interestedInGenders?.includes(user2.gender);
    // Check if user2 is interested in user1's gender
    const user2Interested = user2.interestedInGenders?.includes(user1.gender);
    
    // Both users must be interested in each other's gender
    return user1Interested && user2Interested;
  }

  // Rest of the methods remain the same as in the original file...
  // (truncated for brevity - includes swipe, match, message, and other methods)

  async createSwipe(swipeData: InsertSwipe & { swiperId: string }): Promise<Swipe> {
    const id = randomUUID();
    const swipe: Swipe = {
      id,
      swiperId: swipeData.swiperId,
      swipedId: swipeData.swipedId,
      isLike: swipeData.isLike,
      isSuperLike: swipeData.isSuperLike ?? false,
      meetupPreference: swipeData.meetupPreference || null,
      createdAt: new Date(),
    };
    this.swipes.set(id, swipe);
    return swipe;
  }

  async getUserSwipes(userId: string): Promise<Swipe[]> {
    return Array.from(this.swipes.values())
      .filter(swipe => swipe.swiperId === userId);
  }

  async hasUserSwiped(swiperId: string, swipedId: string): Promise<boolean> {
    return Array.from(this.swipes.values())
      .some(swipe => swipe.swiperId === swiperId && swipe.swipedId === swipedId);
  }

  async checkForMatch(swiperId: string, swipedId: string): Promise<boolean> {
    const swipeBack = Array.from(this.swipes.values())
      .find(swipe => swipe.swiperId === swipedId && swipe.swipedId === swiperId && swipe.isLike);
    
    return !!swipeBack;
  }

  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now
    
    const match: Match = {
      id,
      user1Id,
      user2Id,
      createdAt: now,
      expiresAt,
      isExtended: false,
      isFrozen: false,
      meetupConfirmed: false,
      meetupTime: null,
      meetupLocation: null,
      sharedEventId: null,
      hasMetInPerson: false,
    };
    this.matches.set(id, match);
    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => match.user1Id === userId || match.user2Id === userId);
  }

  async createMessage(messageData: InsertMessage & { senderId: string }): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...messageData,
      id,
      messageType: messageData.messageType || 'text',
      voiceUrl: messageData.voiceUrl || null,
      voiceDuration: messageData.voiceDuration || null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMatchMessages(matchId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.matchId === matchId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getMatchWithUsers(matchId: string): Promise<(Match & { user1: User; user2: User }) | undefined> {
    const match = this.matches.get(matchId);
    if (!match) return undefined;

    const user1 = this.users.get(match.user1Id);
    const user2 = this.users.get(match.user2Id);

    if (!user1 || !user2) return undefined;

    return { ...match, user1, user2 };
  }

  // Placeholder implementations for other required methods
  async extendMatch(matchId: string, userId: string): Promise<Match | null> {
    return null;
  }

  async freezeMatch(matchId: string, userId: string): Promise<Match | null> {
    return null;
  }

  async unfreezeMatch(matchId: string, userId: string): Promise<Match | null> {
    return null;
  }

  async confirmMeetup(matchId: string, userId: string, time: Date, location: string): Promise<Match | null> {
    return null;
  }

  async getActiveMatches(userId: string): Promise<Match[]> {
    return [];
  }

  async markMatchAsMetInPerson(matchId: string): Promise<Match | null> {
    return null;
  }

  // All other methods with placeholder implementations
  async createEvent(event: InsertEvent): Promise<Event> { throw new Error("Not implemented"); }
  async getActiveEvents(): Promise<Event[]> { return []; }
  async joinEvent(eventId: string, userId: string): Promise<EventParticipant> { throw new Error("Not implemented"); }
  async leaveEvent(eventId: string, userId: string): Promise<boolean> { return false; }
  async getEventParticipants(eventId: string): Promise<EventParticipant[]> { return []; }
  async getUserEvents(userId: string): Promise<Event[]> { return []; }
  async createPostMeetReflection(reflection: InsertPostMeetReflection & { userId: string }): Promise<PostMeetReflection> { throw new Error("Not implemented"); }
  async getMatchReflections(matchId: string): Promise<PostMeetReflection[]> { return []; }
  async getUserReflections(userId: string): Promise<PostMeetReflection[]> { return []; }
  async createUserReport(report: InsertUserReport & { reporterId: string }): Promise<UserReport> { throw new Error("Not implemented"); }
  async getUserReports(userId: string): Promise<UserReport[]> { return []; }
  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const id = randomUUID();
    const securityLog: SecurityLog = {
      id,
      userId: log.userId || null,
      eventType: log.eventType || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      success: log.success ?? null,
      riskScore: log.riskScore ?? null,
      details: log.details || null,
      createdAt: new Date()
    };
    this.securityLogs.set(id, securityLog);
    return securityLog;
  }
  async getUserSecurityLogs(userId: string): Promise<SecurityLog[]> { return []; }
  async createPhotoVerification(verification: InsertPhotoVerification & { userId: string }): Promise<PhotoVerification> { throw new Error("Not implemented"); }
  async getUserPhotoVerification(userId: string): Promise<PhotoVerification | undefined> { return undefined; }
  async approvePhotoVerification(verificationId: string): Promise<PhotoVerification | null> { return null; }
  async rejectPhotoVerification(verificationId: string, reason: string): Promise<PhotoVerification | null> { return null; }
  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<BlockedUser> { throw new Error("Not implemented"); }
  async unblockUser(blockerId: string, blockedId: string): Promise<boolean> { return false; }
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> { return false; }
  async getBlockedUsers(userId: string): Promise<BlockedUser[]> { return []; }
  async createTrustedContact(contact: InsertTrustedContact & { userId: string }): Promise<TrustedContact> { throw new Error("Not implemented"); }
  async getTrustedContacts(userId: string): Promise<TrustedContact[]> { return []; }
  async updateTrustedContact(contactId: string, updates: Partial<TrustedContact>): Promise<TrustedContact | null> { return null; }
  async deleteTrustedContact(contactId: string): Promise<boolean> { return false; }
  async createSafetyCheckIn(checkIn: InsertSafetyCheckIn & { userId: string }): Promise<SafetyCheckIn> { throw new Error("Not implemented"); }
  async getUserSafetyCheckIns(userId: string): Promise<SafetyCheckIn[]> { return []; }
  async getOverdueSafetyCheckIns(): Promise<SafetyCheckIn[]> { return []; }
  async createEmergencyAlert(alert: InsertEmergencyAlert & { userId: string }): Promise<EmergencyAlert> { throw new Error("Not implemented"); }
  async getUserEmergencyAlerts(userId: string): Promise<EmergencyAlert[]> { return []; }
  async resolveEmergencyAlert(alertId: string, resolvedBy: string): Promise<EmergencyAlert | null> { return null; }
  async ghostUser(ghosterId: string, ghostedId: string, reason?: string): Promise<GhostedUser> { throw new Error("Not implemented"); }
  async isUserGhosted(ghosterId: string, ghostedId: string): Promise<boolean> { return false; }
  async getGhostedUsers(userId: string): Promise<GhostedUser[]> { return []; }
  async createDateCheckIn(checkIn: InsertDateCheckIn & { userId: string }): Promise<DateCheckIn> { throw new Error("Not implemented"); }
  async getDateCheckIns(matchId: string): Promise<DateCheckIn[]> { return []; }
  async getUserDateCheckIns(userId: string): Promise<DateCheckIn[]> { return []; }
  async createEmergencyShare(share: InsertEmergencyShare & { userId: string }): Promise<EmergencyShare> { throw new Error("Not implemented"); }
  async getUserEmergencyShares(userId: string): Promise<EmergencyShare[]> { return []; }
  async resolveEmergencyShare(shareId: string): Promise<EmergencyShare | null> { return null; }
  async getActiveEmergencyShares(userId: string): Promise<EmergencyShare[]> { return []; }
  async notifyEmergencyContacts(userId: string, shareId: string, contactIds: string[]): Promise<void> { }
}

export const storage = new MemStorage();