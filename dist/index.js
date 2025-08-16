// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import Stripe from "stripe";

// server/video-chat.ts
import { Server as SocketIOServer } from "socket.io";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  swipes;
  matches;
  messages;
  events;
  eventParticipants;
  postMeetReflections;
  userReports;
  securityLogs;
  photoVerifications;
  blockedUsers;
  trustedContacts;
  safetyCheckIns;
  emergencyAlerts;
  ghostedUsers;
  dateCheckIns;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.swipes = /* @__PURE__ */ new Map();
    this.matches = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.events = /* @__PURE__ */ new Map();
    this.eventParticipants = /* @__PURE__ */ new Map();
    this.postMeetReflections = /* @__PURE__ */ new Map();
    this.userReports = /* @__PURE__ */ new Map();
    this.securityLogs = /* @__PURE__ */ new Map();
    this.photoVerifications = /* @__PURE__ */ new Map();
    this.blockedUsers = /* @__PURE__ */ new Map();
    this.trustedContacts = /* @__PURE__ */ new Map();
    this.safetyCheckIns = /* @__PURE__ */ new Map();
    this.emergencyAlerts = /* @__PURE__ */ new Map();
    this.ghostedUsers = /* @__PURE__ */ new Map();
    this.dateCheckIns = /* @__PURE__ */ new Map();
    this.seedMockData();
  }
  seedMockData() {
    const mockUsers = [
      // Add the current user ID that's being used in the app
      {
        id: "701bd80c-33eb-4431-83ab-3006804af554",
        username: "testuser",
        password: "password123",
        email: "test@example.com",
        name: "Test User",
        age: 28,
        bio: "Testing the Criss-Cross app! Looking forward to meeting new people.",
        occupation: "Software Developer",
        location: "City Center",
        isPremium: true,
        profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        interests: ["Technology", "Travel", "Music", "Coffee", "Photography"],
        latitude: 40.7589,
        longitude: -73.9851,
        dailyViewsUsed: 0,
        lastViewReset: /* @__PURE__ */ new Date(),
        lastActive: /* @__PURE__ */ new Date(),
        ageRangeMin: 22,
        ageRangeMax: 35,
        maxDistance: 25,
        dealBreakers: ["smoking"],
        lookingFor: "relationship",
        lifestyle: ["active", "career-focused"],
        values: ["travel", "adventure", "growth"],
        meetReadiness: "within_48h",
        stripeCustomerId: null,
        stripeSubscriptionId: null
      },
      {
        id: "user1",
        username: "emma24",
        password: "password123",
        email: "emma@example.com",
        name: "Emma",
        age: 24,
        bio: "Coffee enthusiast \u2615 | Love hiking and weekend adventures \u{1F3D4}\uFE0F | Always up for trying new restaurants! Looking for someone to explore the city with.",
        occupation: "Graphic Designer",
        location: "Downtown",
        isPremium: true,
        profilePhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        photos: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        interests: ["Photography", "Travel", "Yoga", "Art", "Music"],
        latitude: 40.7589,
        longitude: -73.9851,
        dailyViewsUsed: 0,
        lastViewReset: /* @__PURE__ */ new Date(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1e3),
        // 2 hours ago
        ageRangeMin: 22,
        ageRangeMax: 35,
        maxDistance: 20,
        dealBreakers: ["smoking"],
        lookingFor: "relationship",
        lifestyle: ["active", "social"],
        values: ["travel", "adventure"],
        meetReadiness: "within_48h",
        stripeCustomerId: null,
        stripeSubscriptionId: null
      },
      {
        id: "user2",
        username: "sophie26",
        password: "password123",
        email: "sophie@example.com",
        name: "Sophie",
        age: 26,
        bio: "Fitness enthusiast \u{1F4AA} | Dog mom to Luna \u{1F415} | Weekend warrior seeking adventure buddy",
        occupation: "Marketing Manager",
        location: "Midtown",
        isPremium: false,
        profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        photos: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        interests: ["Fitness", "Dogs", "Hiking", "Cooking"],
        latitude: 40.7505,
        longitude: -73.9934,
        dailyViewsUsed: 0,
        lastViewReset: /* @__PURE__ */ new Date(),
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1e3),
        // 1 hour ago
        ageRangeMin: 24,
        ageRangeMax: 32,
        maxDistance: 15,
        dealBreakers: [],
        lookingFor: "casual",
        lifestyle: ["active", "career-focused"],
        values: ["fitness", "stability"],
        meetReadiness: "this_weekend",
        stripeCustomerId: null,
        stripeSubscriptionId: null
      },
      {
        id: "user3",
        username: "alex28",
        password: "password123",
        email: "alex@example.com",
        name: "Alex",
        age: 28,
        bio: "Software engineer by day, musician by night \u{1F3B8} | Love trying new coffee spots and indie concerts",
        occupation: "Software Engineer",
        location: "Brooklyn",
        isPremium: false,
        profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        interests: ["Music", "Programming", "Coffee", "Concerts"],
        latitude: 40.6892,
        longitude: -73.9442,
        dailyViewsUsed: 0,
        lastViewReset: /* @__PURE__ */ new Date(),
        lastActive: new Date(Date.now() - 30 * 60 * 1e3),
        // 30 minutes ago
        ageRangeMin: 23,
        ageRangeMax: 30,
        maxDistance: 25,
        dealBreakers: ["party_lifestyle"],
        lookingFor: "relationship",
        lifestyle: ["homebody", "career-focused"],
        values: ["family", "stability"],
        meetReadiness: "flexible",
        stripeCustomerId: null,
        stripeSubscriptionId: null
      }
    ];
    mockUsers.forEach((user) => {
      const completeUser = {
        ...user,
        isEmailVerified: false,
        isPhoneVerified: false,
        isPhotoVerified: user.name === "Emma" || user.name === "Test User" ? true : false,
        // Emma and Test User are verified
        photoVerificationDate: user.name === "Emma" || user.name === "Test User" ? /* @__PURE__ */ new Date("2025-01-15") : null,
        isIdVerified: false,
        phoneNumber: null,
        emailVerificationToken: null,
        phoneVerificationToken: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        lastPasswordChange: /* @__PURE__ */ new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        privacySettings: "{}",
        reportedCount: 0,
        isBanned: false,
        bannedUntil: null,
        accountCreatedAt: /* @__PURE__ */ new Date(),
        lastIpAddress: null,
        deviceIds: [],
        loginHistory: "[]"
      };
      this.users.set(user.id, completeUser);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
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
      lastViewReset: /* @__PURE__ */ new Date(),
      lastActive: /* @__PURE__ */ new Date(),
      ageRangeMin: insertUser.ageRangeMin || 18,
      ageRangeMax: insertUser.ageRangeMax || 35,
      maxDistance: insertUser.maxDistance || 25,
      dealBreakers: insertUser.dealBreakers || [],
      lookingFor: insertUser.lookingFor || "relationship",
      lifestyle: insertUser.lifestyle || [],
      values: insertUser.values || [],
      meetReadiness: insertUser.meetReadiness || "flexible",
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async updateStripeCustomerId(userId, customerId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  async updateUserStripeInfo(userId, stripeInfo) {
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
  async updateDailyViews(userId) {
    const user = this.users.get(userId);
    if (!user) return;
    await this.resetDailyViewsIfNeeded(userId);
    const updatedUser = { ...user, dailyViewsUsed: (user.dailyViewsUsed ?? 0) + 1 };
    this.users.set(userId, updatedUser);
  }
  async resetDailyViewsIfNeeded(userId) {
    const user = this.users.get(userId);
    if (!user) return;
    const now = /* @__PURE__ */ new Date();
    const lastReset = user.lastViewReset ? new Date(user.lastViewReset) : /* @__PURE__ */ new Date();
    const diffHours = (now.getTime() - lastReset.getTime()) / (1e3 * 60 * 60);
    if (diffHours >= 24) {
      const updatedUser = { ...user, dailyViewsUsed: 0, lastViewReset: now };
      this.users.set(userId, updatedUser);
    }
  }
  async getDiscoverableUsers(userId, excludeIds) {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];
    const ghostedUsers2 = await this.getGhostedUsers(userId);
    const ghostedUserIds = ghostedUsers2.map((ghost) => ghost.ghostedId);
    const usersWhoGhostedMe = Array.from(this.ghostedUsers.values()).filter((ghost) => ghost.ghostedId === userId).map((ghost) => ghost.ghosterId);
    const allExcludeIds = [...excludeIds, userId, ...ghostedUserIds, ...usersWhoGhostedMe];
    const candidates = Array.from(this.users.values()).filter((user) => !allExcludeIds.includes(user.id));
    const nearbyUsers = candidates.map((user) => ({
      ...user,
      distance: this.calculateDistance(currentUser, user)
    })).filter((user) => user.distance <= 5).sort((a, b) => a.distance - b.distance).slice(0, 10);
    return nearbyUsers;
  }
  async getCompatibleUsers(userId, excludeIds) {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];
    const allExcludeIds = [...excludeIds, userId];
    const candidates = Array.from(this.users.values()).filter((user) => !allExcludeIds.includes(user.id));
    const compatibleUsers = candidates.map((candidate) => this.calculateCompatibility(currentUser, candidate)).filter((result) => {
      const score = result.compatibilityScore ?? 0;
      const distance = result.distance ?? 999;
      return score > 50 && distance <= 3;
    }).sort((a, b) => {
      const aDist = a.distance ?? 999;
      const bDist = b.distance ?? 999;
      if (Math.abs(aDist - bDist) > 0.5) return aDist - bDist;
      return (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0);
    }).slice(0, 5);
    return compatibleUsers;
  }
  async updateUserPreferences(userId, preferences) {
    const user = this.users.get(userId);
    if (!user) return void 0;
    const updatedUser = { ...user, ...preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  calculateCompatibility(user1, user2) {
    let score = 0;
    const reasons = [];
    const user1AgeMin = user1.ageRangeMin ?? 18;
    const user1AgeMax = user1.ageRangeMax ?? 35;
    const user2AgeMin = user2.ageRangeMin ?? 18;
    const user2AgeMax = user2.ageRangeMax ?? 35;
    const user1MaxDist = user1.maxDistance ?? 25;
    const user2MaxDist = user2.maxDistance ?? 25;
    const user1DealBreakers = user1.dealBreakers ?? [];
    const user2DealBreakers = user2.dealBreakers ?? [];
    if (user2.age >= user1AgeMin && user2.age <= user1AgeMax && user1.age >= user2AgeMin && user1.age <= user2AgeMax) {
      score += 20;
      reasons.push("Age preferences match");
    } else if (user2.age < user1AgeMin || user2.age > user1AgeMax || user1.age < user2AgeMin || user1.age > user2AgeMax) {
      return { ...user2, compatibilityScore: 0, compatibilityReasons: ["Age preferences don't match"] };
    }
    const distance = this.calculateDistance(user1, user2);
    if (distance <= Math.min(user1MaxDist, user2MaxDist)) {
      const distanceScore = Math.max(0, 15 - distance / 5);
      score += distanceScore;
      reasons.push(`Within distance preference (${distance.toFixed(1)}km away)`);
    } else {
      return { ...user2, compatibilityScore: 0, compatibilityReasons: ["Too far away"], distance };
    }
    const hasUserDealBreaker = user1DealBreakers.some(
      (dealBreaker) => user2.lifestyle?.includes(dealBreaker) || user2.values?.includes(dealBreaker)
    );
    const hasTargetDealBreaker = user2DealBreakers.some(
      (dealBreaker) => user1.lifestyle?.includes(dealBreaker) || user1.values?.includes(dealBreaker)
    );
    if (hasUserDealBreaker || hasTargetDealBreaker) {
      return { ...user2, compatibilityScore: 0, compatibilityReasons: ["Deal breaker present"], distance };
    }
    if (user1.lookingFor === user2.lookingFor) {
      score += 15;
      reasons.push("Same relationship goals");
    } else if (user1.lookingFor === "casual" && user2.lookingFor === "friendship" || user1.lookingFor === "friendship" && user2.lookingFor === "casual") {
      score += 8;
      reasons.push("Compatible casual goals");
    }
    const sharedInterests = user1.interests?.filter(
      (interest) => user2.interests?.includes(interest)
    ) || [];
    const interestScore = Math.min(20, sharedInterests.length * 4);
    score += interestScore;
    if (sharedInterests.length > 0) {
      reasons.push(`${sharedInterests.length} shared interests: ${sharedInterests.slice(0, 3).join(", ")}`);
    }
    const sharedLifestyle = user1.lifestyle?.filter(
      (style) => user2.lifestyle?.includes(style)
    ) || [];
    const lifestyleScore = Math.min(15, sharedLifestyle.length * 5);
    score += lifestyleScore;
    if (sharedLifestyle.length > 0) {
      reasons.push(`Compatible lifestyle: ${sharedLifestyle.join(", ")}`);
    }
    const sharedValues = user1.values?.filter(
      (value) => user2.values?.includes(value)
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
  calculateDistance(user1, user2) {
    if (!user1.latitude || !user1.longitude || !user2.latitude || !user2.longitude) {
      return 999;
    }
    const R = 6371;
    const dLat = this.toRadians(user2.latitude - user1.latitude);
    const dLon = this.toRadians(user2.longitude - user1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(user1.latitude)) * Math.cos(this.toRadians(user2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  async createSwipe(swipeData) {
    const id = randomUUID();
    const swipe = {
      id,
      swiperId: swipeData.swiperId,
      swipedId: swipeData.swipedId,
      isLike: swipeData.isLike,
      isSuperLike: swipeData.isSuperLike ?? false,
      meetupPreference: swipeData.meetupPreference || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.swipes.set(id, swipe);
    return swipe;
  }
  async getUserSwipes(userId) {
    return Array.from(this.swipes.values()).filter((swipe) => swipe.swiperId === userId);
  }
  async hasUserSwiped(swiperId, swipedId) {
    return Array.from(this.swipes.values()).some((swipe) => swipe.swiperId === swiperId && swipe.swipedId === swipedId);
  }
  async checkForMatch(swiperId, swipedId) {
    const swipeBack = Array.from(this.swipes.values()).find((swipe) => swipe.swiperId === swipedId && swipe.swipedId === swiperId && swipe.isLike);
    return !!swipeBack;
  }
  async createMatch(user1Id, user2Id) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1e3);
    const match = {
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
      hasMetInPerson: false
    };
    this.matches.set(id, match);
    return match;
  }
  async getUserMatches(userId) {
    return Array.from(this.matches.values()).filter((match) => match.user1Id === userId || match.user2Id === userId);
  }
  async createMessage(messageData) {
    const id = randomUUID();
    const message = {
      ...messageData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  async getMatchMessages(matchId) {
    return Array.from(this.messages.values()).filter((message) => message.matchId === matchId).sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return aTime - bTime;
    });
  }
  async getMatchWithUsers(matchId) {
    const match = this.matches.get(matchId);
    if (!match) return void 0;
    const user1 = this.users.get(match.user1Id);
    const user2 = this.users.get(match.user2Id);
    if (!user1 || !user2) return void 0;
    return { ...match, user1, user2 };
  }
  async extendMatch(matchId, userId) {
    const match = this.matches.get(matchId);
    if (!match || match.user1Id !== userId && match.user2Id !== userId) {
      return null;
    }
    if (match.isExtended) {
      throw new Error("Match has already been extended");
    }
    const user = this.users.get(userId);
    if (!user?.isPremium) {
      throw new Error("Premium subscription required to extend matches");
    }
    const newExpiresAt = new Date((match.expiresAt || /* @__PURE__ */ new Date()).getTime() + 24 * 60 * 60 * 1e3);
    const updatedMatch = { ...match, expiresAt: newExpiresAt, isExtended: true };
    this.matches.set(matchId, updatedMatch);
    return updatedMatch;
  }
  async freezeMatch(matchId, userId) {
    const match = this.matches.get(matchId);
    if (!match || match.user1Id !== userId && match.user2Id !== userId) {
      return null;
    }
    const user = this.users.get(userId);
    if (!user?.isPremium) {
      throw new Error("Premium subscription required to freeze matches");
    }
    const updatedMatch = { ...match, isFrozen: true };
    this.matches.set(matchId, updatedMatch);
    return updatedMatch;
  }
  async unfreezeMatch(matchId, userId) {
    const match = this.matches.get(matchId);
    if (!match || match.user1Id !== userId && match.user2Id !== userId) {
      return null;
    }
    const user = this.users.get(userId);
    if (!user?.isPremium) {
      throw new Error("Premium subscription required to manage frozen matches");
    }
    const updatedMatch = { ...match, isFrozen: false };
    this.matches.set(matchId, updatedMatch);
    return updatedMatch;
  }
  async confirmMeetup(matchId, userId, time, location) {
    const match = this.matches.get(matchId);
    if (!match || match.user1Id !== userId && match.user2Id !== userId) {
      return null;
    }
    const updatedMatch = {
      ...match,
      meetupConfirmed: true,
      meetupTime: time,
      meetupLocation: location
    };
    this.matches.set(matchId, updatedMatch);
    return updatedMatch;
  }
  async getActiveMatches(userId) {
    const now = /* @__PURE__ */ new Date();
    return Array.from(this.matches.values()).filter((match) => {
      const isUserMatch = match.user1Id === userId || match.user2Id === userId;
      const isNotExpired = match.isFrozen || match.expiresAt && match.expiresAt > now;
      return isUserMatch && isNotExpired && !match.meetupConfirmed;
    });
  }
  async getFilteredUsers(userId, filters) {
    const currentUser = this.users.get(userId);
    if (!currentUser) return [];
    const swipedIds = Array.from(this.swipes.values()).filter((swipe) => swipe.swiperId === userId).map((swipe) => swipe.swipedId);
    const excludeIds = [userId, ...swipedIds];
    let users2;
    if (filters.useCompatibilityMatching) {
      users2 = await this.getCompatibleUsers(userId, excludeIds);
    } else {
      const basicUsers = await this.getDiscoverableUsers(userId, excludeIds);
      users2 = basicUsers.map((user) => ({
        ...user,
        distance: this.calculateDistance(currentUser, user)
      }));
    }
    if (filters.isPremium) {
      console.log("Premium user timeline filtering for:", currentUser.meetReadiness);
      users2 = users2.map((user) => {
        const alignment = this.calculateTimelineAlignment(currentUser.meetReadiness || "flexible", user.meetReadiness || "flexible");
        const reason = this.getTimelineReason(currentUser.meetReadiness || "flexible", user.meetReadiness || "flexible");
        console.log(`User ${user.name}: ${user.meetReadiness} -> alignment: ${alignment}, reason: ${reason}`);
        return {
          ...user,
          timelineAlignment: alignment,
          timelineReason: reason
        };
      });
      users2.sort((a, b) => (b.timelineAlignment || 0) - (a.timelineAlignment || 0));
    }
    return users2;
  }
  calculateTimelineAlignment(userReadiness, otherReadiness) {
    const timelineValues = {
      "within_48h": 4,
      "this_weekend": 3,
      "after_coffee_chat": 2,
      "flexible": 1
    };
    const userValue = timelineValues[userReadiness] || 1;
    const otherValue = timelineValues[otherReadiness] || 1;
    if (userReadiness === otherReadiness) return 100;
    const difference = Math.abs(userValue - otherValue);
    if (difference === 1) return 80;
    if (difference === 2) return 60;
    if (difference === 3) return 40;
    return 20;
  }
  // Missing methods implementation
  async markMatchAsMetInPerson(matchId) {
    const match = this.matches.get(matchId);
    if (!match) return null;
    const updatedMatch = { ...match, hasMetInPerson: true };
    this.matches.set(matchId, updatedMatch);
    return updatedMatch;
  }
  async createEvent(eventData) {
    const id = randomUUID();
    const event = {
      ...eventData,
      id,
      currentParticipants: 0,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.events.set(id, event);
    this.seedMockEvents();
    return event;
  }
  async getActiveEvents() {
    this.seedMockEvents();
    return Array.from(this.events.values()).filter((event) => event.isActive && event.date > /* @__PURE__ */ new Date()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  async getEventParticipants(eventId) {
    return Array.from(this.eventParticipants.values()).filter((participant) => participant.eventId === eventId);
  }
  async joinEvent(eventId, userId) {
    const event = this.events.get(eventId);
    if (!event) throw new Error("Event not found");
    const id = randomUUID();
    const participant = {
      id,
      eventId,
      userId,
      joinedAt: /* @__PURE__ */ new Date()
    };
    this.eventParticipants.set(id, participant);
    const updatedEvent = { ...event, currentParticipants: (event.currentParticipants || 0) + 1 };
    this.events.set(eventId, updatedEvent);
    return participant;
  }
  async leaveEvent(eventId, userId) {
    const participantEntry = Array.from(this.eventParticipants.entries()).find(([_, participant]) => participant.eventId === eventId && participant.userId === userId);
    if (!participantEntry) return false;
    this.eventParticipants.delete(participantEntry[0]);
    const event = this.events.get(eventId);
    if (event) {
      const updatedEvent = { ...event, currentParticipants: Math.max(0, (event.currentParticipants || 0) - 1) };
      this.events.set(eventId, updatedEvent);
    }
    return true;
  }
  async getUserEvents(userId) {
    const userParticipants = Array.from(this.eventParticipants.values()).filter((participant) => participant.userId === userId);
    const eventIds = userParticipants.map((participant) => participant.eventId);
    return Array.from(this.events.values()).filter((event) => eventIds.includes(event.id)).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  async findSharedEventMatches(userId) {
    const userEvents = await this.getUserEvents(userId);
    const userEventIds = userEvents.map((event) => event.id);
    const sharedParticipants = Array.from(this.eventParticipants.values()).filter(
      (participant) => userEventIds.includes(participant.eventId) && participant.userId !== userId
    );
    const userIds = [...new Set(sharedParticipants.map((participant) => participant.userId))];
    return Array.from(this.users.values()).filter((user) => userIds.includes(user.id));
  }
  async createPostMeetReflection(reflectionData) {
    const id = randomUUID();
    const reflection = {
      ...reflectionData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.postMeetReflections.set(id, reflection);
    return reflection;
  }
  async getMatchReflections(matchId) {
    return Array.from(this.postMeetReflections.values()).filter((reflection) => reflection.matchId === matchId);
  }
  async getUserReflection(matchId, userId) {
    const reflection = Array.from(this.postMeetReflections.values()).find((reflection2) => reflection2.matchId === matchId && reflection2.userId === userId);
    return reflection || null;
  }
  async getSharedReflections(matchId) {
    return Array.from(this.postMeetReflections.values()).filter((reflection) => reflection.matchId === matchId && reflection.isVisible);
  }
  seedMockEvents() {
    if (this.events.size > 0) return;
    const mockEvents = [
      {
        id: "event1",
        title: "Photography Workshop: Street Photography Basics",
        description: "Learn the fundamentals of street photography with professional photographer. We'll cover composition, lighting, and storytelling through urban scenes.",
        category: "workshop",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3),
        // 3 days from now
        location: "Central Park, NYC",
        maxParticipants: 12,
        currentParticipants: 4,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "event2",
        title: "Community Garden Volunteering",
        description: "Help maintain the local community garden. Activities include planting, weeding, and harvest preparation. All skill levels welcome!",
        category: "volunteering",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3),
        // 5 days from now
        location: "Brooklyn Community Garden",
        maxParticipants: 20,
        currentParticipants: 7,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "event3",
        title: "Yoga in the Park",
        description: "Join us for a relaxing outdoor yoga session suitable for all levels. Bring your own mat and water bottle.",
        category: "social",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3),
        // 2 days from now
        location: "Washington Square Park",
        maxParticipants: 15,
        currentParticipants: 8,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "event4",
        title: "Tech Meetup: AI in Dating Apps",
        description: "Discussion panel about the role of artificial intelligence in modern dating applications. Network with fellow tech enthusiasts.",
        category: "workshop",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
        // 7 days from now
        location: "WeWork SoHo",
        maxParticipants: 30,
        currentParticipants: 12,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    mockEvents.forEach((event) => {
      this.events.set(event.id, event);
    });
  }
  getTimelineReason(userReadiness, otherReadiness) {
    const readinessLabels = {
      "within_48h": "within 48 hours",
      "this_weekend": "this weekend",
      "after_coffee_chat": "after a coffee chat",
      "flexible": "flexible timing"
    };
    const userLabel = readinessLabels[userReadiness];
    const otherLabel = readinessLabels[otherReadiness];
    if (userReadiness === otherReadiness) {
      return `Both prefer meeting ${userLabel}`;
    }
    return `You prefer ${userLabel}, they prefer ${otherLabel}`;
  }
  // Security and reporting methods
  async createUserReport(report) {
    const id = randomUUID();
    const userReport = {
      id,
      ...report,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date(),
      moderatorNotes: null,
      actionTaken: null,
      resolvedAt: null
    };
    this.userReports.set(id, userReport);
    return userReport;
  }
  async getUserReports(userId) {
    return Array.from(this.userReports.values()).filter(
      (report) => report.reporterId === userId
    );
  }
  async getReportsByUser(reportedUserId) {
    return Array.from(this.userReports.values()).filter(
      (report) => report.reportedUserId === reportedUserId
    );
  }
  async updateReportStatus(reportId, status, moderatorNotes, actionTaken) {
    const report = this.userReports.get(reportId);
    if (!report) return null;
    const updatedReport = {
      ...report,
      status,
      moderatorNotes: moderatorNotes || report.moderatorNotes,
      actionTaken: actionTaken || report.actionTaken,
      resolvedAt: status === "resolved" ? /* @__PURE__ */ new Date() : report.resolvedAt
    };
    this.userReports.set(reportId, updatedReport);
    return updatedReport;
  }
  // Security logging
  async createSecurityLog(log2) {
    const id = randomUUID();
    const securityLog = {
      id,
      ...log2,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.securityLogs.set(id, securityLog);
    return securityLog;
  }
  async getUserSecurityLogs(userId, limit = 50) {
    const logs = Array.from(this.securityLogs.values()).filter((log2) => log2.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
    return logs;
  }
  async getSecurityLogsByType(eventType, limit = 50) {
    const logs = Array.from(this.securityLogs.values()).filter((log2) => log2.eventType === eventType).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
    return logs;
  }
  // Photo verification
  async createPhotoVerification(verification) {
    const id = randomUUID();
    const photoVerification = {
      id,
      ...verification,
      status: "pending",
      confidence: null,
      moderatorReviewed: false,
      moderatorNotes: null,
      failureReason: null,
      createdAt: /* @__PURE__ */ new Date(),
      reviewedAt: null
    };
    this.photoVerifications.set(id, photoVerification);
    return photoVerification;
  }
  async getUserPhotoVerification(userId) {
    const verification = Array.from(this.photoVerifications.values()).find((v) => v.userId === userId);
    return verification || null;
  }
  async updatePhotoVerificationStatus(verificationId, status, moderatorNotes) {
    const verification = this.photoVerifications.get(verificationId);
    if (!verification) return null;
    const updated = {
      ...verification,
      status,
      moderatorNotes: moderatorNotes || verification.moderatorNotes,
      moderatorReviewed: true,
      reviewedAt: /* @__PURE__ */ new Date()
    };
    this.photoVerifications.set(verificationId, updated);
    return updated;
  }
  async getPendingPhotoVerifications() {
    return Array.from(this.photoVerifications.values()).filter((v) => v.status === "pending");
  }
  // Blocking functionality
  async blockUser(blockerId, blockedUserId, reason) {
    const id = randomUUID();
    const blockedUser = {
      id,
      blockerId,
      blockedUserId,
      reason: reason || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.blockedUsers.set(id, blockedUser);
    return blockedUser;
  }
  async unblockUser(blockerId, blockedUserId) {
    const blockedUser = Array.from(this.blockedUsers.values()).find((b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId);
    if (blockedUser) {
      this.blockedUsers.delete(blockedUser.id);
      return true;
    }
    return false;
  }
  async getBlockedUsers(userId) {
    return Array.from(this.blockedUsers.values()).filter((b) => b.blockerId === userId);
  }
  async isUserBlocked(blockerId, blockedUserId) {
    return Array.from(this.blockedUsers.values()).some((b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId);
  }
  // Trusted contacts
  async createTrustedContact(contact) {
    const id = randomUUID();
    const trustedContact = {
      id,
      ...contact,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.trustedContacts.set(id, trustedContact);
    return trustedContact;
  }
  async getUserTrustedContacts(userId) {
    return Array.from(this.trustedContacts.values()).filter((c) => c.userId === userId);
  }
  async updateTrustedContact(contactId, updates) {
    const contact = this.trustedContacts.get(contactId);
    if (!contact) return null;
    const updated = { ...contact, ...updates };
    this.trustedContacts.set(contactId, updated);
    return updated;
  }
  async deleteTrustedContact(contactId, userId) {
    const contact = this.trustedContacts.get(contactId);
    if (contact && contact.userId === userId) {
      this.trustedContacts.delete(contactId);
      return true;
    }
    return false;
  }
  // Safety check-ins
  async createSafetyCheckIn(checkIn) {
    const id = randomUUID();
    const safetyCheckIn = {
      id,
      ...checkIn,
      checkInTime: /* @__PURE__ */ new Date(),
      status: "scheduled",
      emergencyTriggered: false,
      trustedContactNotified: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.safetyCheckIns.set(id, safetyCheckIn);
    return safetyCheckIn;
  }
  async getUserSafetyCheckIns(userId) {
    return Array.from(this.safetyCheckIns.values()).filter((c) => c.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async updateSafetyCheckInStatus(checkInId, status) {
    const checkIn = this.safetyCheckIns.get(checkInId);
    if (!checkIn) return null;
    const updated = {
      ...checkIn,
      status,
      checkInTime: status === "checked_in" ? /* @__PURE__ */ new Date() : checkIn.checkInTime,
      emergencyTriggered: status === "emergency_triggered"
    };
    this.safetyCheckIns.set(checkInId, updated);
    return updated;
  }
  async getMissedSafetyCheckIns() {
    const now = /* @__PURE__ */ new Date();
    return Array.from(this.safetyCheckIns.values()).filter(
      (c) => c.status === "scheduled" && new Date(c.scheduledFor).getTime() < now.getTime() - 30 * 60 * 1e3
      // 30 minutes grace period
    );
  }
  // Safety toolkit implementations
  async createEmergencyAlert(alert) {
    const emergencyAlert = {
      id: randomUUID(),
      triggeredAt: /* @__PURE__ */ new Date(),
      status: "active",
      contactsNotified: [],
      resolvedAt: null,
      resolvedBy: null,
      ...alert
    };
    this.emergencyAlerts.set(emergencyAlert.id, emergencyAlert);
    await this.createSecurityLog({
      userId: alert.userId,
      eventType: "emergency_alert_triggered",
      success: true,
      details: JSON.stringify({ alertType: alert.alertType, location: alert.location })
    });
    return emergencyAlert;
  }
  async getUserEmergencyAlerts(userId) {
    return Array.from(this.emergencyAlerts.values()).filter(
      (alert) => alert.userId === userId
    );
  }
  async resolveEmergencyAlert(alertId, resolvedBy) {
    const alert = this.emergencyAlerts.get(alertId);
    if (!alert) return null;
    const updatedAlert = {
      ...alert,
      status: "resolved",
      resolvedAt: /* @__PURE__ */ new Date(),
      resolvedBy
    };
    this.emergencyAlerts.set(alertId, updatedAlert);
    return updatedAlert;
  }
  async ghostUser(ghosterId, ghostedId, reason) {
    const ghostedUser = {
      id: randomUUID(),
      ghosterId,
      ghostedId,
      reason: reason || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.ghostedUsers.set(ghostedUser.id, ghostedUser);
    await this.createSecurityLog({
      userId: ghosterId,
      eventType: "user_ghosted",
      success: true,
      details: JSON.stringify({ ghostedUserId: ghostedId, reason })
    });
    return ghostedUser;
  }
  async isUserGhosted(ghosterId, ghostedId) {
    return Array.from(this.ghostedUsers.values()).some(
      (ghost) => ghost.ghosterId === ghosterId && ghost.ghostedId === ghostedId
    ) || Array.from(this.ghostedUsers.values()).some(
      (ghost) => ghost.ghosterId === ghostedId && ghost.ghostedId === ghosterId
    );
  }
  async getGhostedUsers(userId) {
    return Array.from(this.ghostedUsers.values()).filter(
      (ghost) => ghost.ghosterId === userId
    );
  }
  async createDateCheckIn(checkIn) {
    const dateCheckIn = {
      id: randomUUID(),
      responseTime: /* @__PURE__ */ new Date(),
      status: checkIn.needsHelp ? "help_needed" : "safe",
      emergencyTriggered: false,
      createdAt: /* @__PURE__ */ new Date(),
      ...checkIn
    };
    this.dateCheckIns.set(dateCheckIn.id, dateCheckIn);
    if (checkIn.needsHelp) {
      await this.createEmergencyAlert({
        userId: checkIn.userId,
        location: checkIn.location || "{}",
        alertType: "help_needed",
        additionalInfo: "Date check-in: User requested help during meetup"
      });
      dateCheckIn.emergencyTriggered = true;
      this.dateCheckIns.set(dateCheckIn.id, dateCheckIn);
    }
    return dateCheckIn;
  }
  async getDateCheckIns(matchId) {
    return Array.from(this.dateCheckIns.values()).filter(
      (checkIn) => checkIn.matchId === matchId
    );
  }
  async getUserDateCheckIns(userId) {
    return Array.from(this.dateCheckIns.values()).filter(
      (checkIn) => checkIn.userId === userId
    );
  }
};
var storage = new MemStorage();
var VideoChatStorage = class {
  videoChatSessions = /* @__PURE__ */ new Map();
  async createVideoChatSession(sessionData) {
    const id = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session2 = {
      id,
      matchId: sessionData.matchId,
      initiatorId: sessionData.initiatorId,
      participantId: sessionData.participantId,
      sessionToken: sessionData.sessionToken,
      status: sessionData.status || "pending",
      startedAt: sessionData.startedAt || null,
      endedAt: sessionData.endedAt || null,
      duration: sessionData.duration || null,
      callQuality: sessionData.callQuality || null,
      verifiedConnection: sessionData.verifiedConnection || false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.videoChatSessions.set(id, session2);
    return session2;
  }
  async updateVideoChatSession(sessionId, updates) {
    const session2 = this.videoChatSessions.get(sessionId);
    if (!session2) return void 0;
    const updatedSession = { ...session2, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.videoChatSessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  async getVideoChatSessions(matchId) {
    return Array.from(this.videoChatSessions.values()).filter((session2) => session2.matchId === matchId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
  async getVideoChatSession(sessionId) {
    return this.videoChatSessions.get(sessionId);
  }
};
var videoChatStorage = new VideoChatStorage();
storage.createVideoChatSession = videoChatStorage.createVideoChatSession.bind(videoChatStorage);
storage.updateVideoChatSession = videoChatStorage.updateVideoChatSession.bind(videoChatStorage);
storage.getVideoChatSessions = videoChatStorage.getVideoChatSessions.bind(videoChatStorage);
storage.getVideoChatSession = videoChatStorage.getVideoChatSession.bind(videoChatStorage);

// server/video-chat.ts
function setupVideoChat(httpServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/ws",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const users2 = /* @__PURE__ */ new Map();
  const activeRooms = /* @__PURE__ */ new Map();
  io.on("connection", (socket) => {
    console.log("User connected to video chat:", socket.id);
    socket.on("join-room", (matchId) => {
      socket.join(matchId);
      if (!activeRooms.has(matchId)) {
        activeRooms.set(matchId, /* @__PURE__ */ new Set());
      }
      activeRooms.get(matchId).add(socket.id);
      console.log(`User ${socket.id} joined room ${matchId}`);
    });
    socket.on("initiate-call", async (data) => {
      const { sessionId, to, from, matchId, callerName } = data;
      try {
        await storage.updateVideoChatSession(sessionId, {
          status: "pending"
        });
        socket.to(matchId).emit("incoming-call", {
          sessionId,
          from,
          callerName,
          matchId
        });
        console.log(`Call initiated from ${from} to ${to} in match ${matchId}`);
      } catch (error) {
        console.error("Error initiating call:", error);
        socket.emit("call-error", { message: "Failed to initiate call" });
      }
    });
    socket.on("accept-call", async (data) => {
      const { sessionId, to, from } = data;
      try {
        await storage.updateVideoChatSession(sessionId, {
          status: "active",
          startedAt: /* @__PURE__ */ new Date()
        });
        socket.to(data.matchId || "room").emit("call-accepted", {
          sessionId,
          from
        });
        console.log(`Call accepted: session ${sessionId}`);
      } catch (error) {
        console.error("Error accepting call:", error);
      }
    });
    socket.on("reject-call", async (data) => {
      const { sessionId, to } = data;
      try {
        await storage.updateVideoChatSession(sessionId, {
          status: "declined"
        });
        socket.to(data.matchId || "room").emit("call-rejected", {
          sessionId
        });
        console.log(`Call rejected: session ${sessionId}`);
      } catch (error) {
        console.error("Error rejecting call:", error);
      }
    });
    socket.on("end-call", async (data) => {
      const { to, from, matchId } = data;
      socket.to(matchId).emit("call-ended", {
        from
      });
      console.log(`Call ended in match ${matchId}`);
    });
    socket.on("peer-signal", (data) => {
      const { signal, to, from, matchId } = data;
      socket.to(matchId).emit("peer-signal", signal);
      console.log(`Peer signal forwarded from ${from} to ${to}`);
    });
    socket.on("leave-room", (matchId) => {
      socket.leave(matchId);
      if (activeRooms.has(matchId)) {
        activeRooms.get(matchId).delete(socket.id);
        if (activeRooms.get(matchId).size === 0) {
          activeRooms.delete(matchId);
        }
      }
      console.log(`User ${socket.id} left room ${matchId}`);
    });
    socket.on("disconnect", () => {
      console.log("User disconnected from video chat:", socket.id);
      for (const [matchId, socketIds] of activeRooms.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            activeRooms.delete(matchId);
          }
          break;
        }
      }
      users2.delete(socket.id);
    });
  });
  return io;
}

// server/routes.ts
import session from "express-session";

// server/security.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";
var JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");
var SALT_ROUNDS = 12;
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateAccessToken(userId) {
  return jwt.sign(
    { userId, type: "access" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}
function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { userId: decoded.userId, type: decoded.type };
  } catch {
    return null;
  }
}
function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}
function generateDeviceFingerprint(req) {
  const userAgent = req.headers["user-agent"] || "";
  const acceptLanguage = req.headers["accept-language"] || "";
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const fingerprint = crypto.createHash("sha256").update(userAgent + acceptLanguage + acceptEncoding).digest("hex");
  return fingerprint.substring(0, 16);
}
function calculateRiskScore(req, user) {
  let riskScore = 0;
  const hour = (/* @__PURE__ */ new Date()).getHours();
  if (hour >= 2 && hour <= 5) riskScore += 10;
  if (user?.failedLoginAttempts > 3) riskScore += 30;
  if (user?.failedLoginAttempts > 5) riskScore += 50;
  if (user?.accountCreatedAt) {
    const daysSinceCreation = (Date.now() - new Date(user.accountCreatedAt).getTime()) / (1e3 * 60 * 60 * 24);
    if (daysSinceCreation < 1) riskScore += 20;
    else if (daysSinceCreation < 7) riskScore += 10;
  }
  const currentIP = req.ip || req.connection.remoteAddress;
  if (user?.lastIpAddress && user.lastIpAddress !== currentIP) {
    riskScore += 15;
  }
  return Math.min(riskScore, 100);
}
function getLocationFromIP(ip) {
  if (ip.startsWith("192.168") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return "Local Network";
  }
  return "Unknown Location";
}
async function logSecurityEvent(params) {
  const { userId, eventType, req, success = true, details = {}, riskScore = 0 } = params;
  const securityLog = {
    userId,
    eventType,
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"],
    deviceFingerprint: generateDeviceFingerprint(req),
    success,
    details: JSON.stringify(details),
    riskScore,
    location: getLocationFromIP(req.ip || "")
  };
  try {
    await storage.createSecurityLog(securityLog);
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}
function isAccountLocked(user) {
  if (!user.accountLockedUntil) return false;
  return /* @__PURE__ */ new Date() < new Date(user.accountLockedUntil);
}
function shouldLockAccount(failedAttempts) {
  return failedAttempts >= 5;
}
function calculateLockDuration(failedAttempts) {
  if (failedAttempts >= 10) return 30 * 60 * 1e3;
  if (failedAttempts >= 5) return 5 * 60 * 1e3;
  return 0;
}
function isStrongPassword(password) {
  const issues = [];
  if (password.length < 8) issues.push("Password must be at least 8 characters");
  if (password.length > 128) issues.push("Password must be less than 128 characters");
  if (!/[A-Z]/.test(password)) issues.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("Password must contain at least one lowercase letter");
  if (!/\d/.test(password)) issues.push("Password must contain at least one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) issues.push("Password must contain at least one special character");
  const commonPasswords = ["password", "123456", "qwerty", "abc123", "password123"];
  if (commonPasswords.includes(password.toLowerCase())) {
    issues.push("Password is too common");
  }
  return {
    isValid: issues.length === 0,
    issues
  };
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// server/auth.ts
async function authenticateToken(req, res, next) {
  try {
    if (req.session.userId && req.session.accessToken) {
      const tokenData = verifyToken(req.session.accessToken);
      if (tokenData && tokenData.userId === req.session.userId) {
        const user = await storage.getUser(tokenData.userId);
        if (user) {
          if (isAccountLocked(user)) {
            await logSecurityEvent({
              userId: user.id,
              eventType: "login_attempt_locked_account",
              req,
              success: false,
              details: { reason: "Account locked" }
            });
            return res.status(423).json({ message: "Account is temporarily locked" });
          }
          if (user.isBanned) {
            const banMessage = user.bannedUntil ? `Account is banned until ${user.bannedUntil}` : "Account is permanently banned";
            return res.status(403).json({ message: banMessage });
          }
          req.user = user;
          req.session.lastActivity = /* @__PURE__ */ new Date();
          await storage.updateUser(user.id, { lastActive: /* @__PURE__ */ new Date() });
          return next();
        }
      }
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const tokenData = verifyToken(token);
      if (tokenData) {
        const user = await storage.getUser(tokenData.userId);
        if (user && !isAccountLocked(user) && !user.isBanned) {
          req.user = user;
          await storage.updateUser(user.id, { lastActive: /* @__PURE__ */ new Date() });
          return next();
        }
      }
    }
    await logSecurityEvent({
      eventType: "unauthorized_access_attempt",
      req,
      success: false,
      details: { endpoint: req.path }
    });
    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
}
async function requirePremium(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await storage.getUser(req.user.id);
    if (!user || !user.isPremium) {
      return res.status(403).json({
        message: "Premium subscription required",
        upgradeUrl: "/subscribe"
      });
    }
    next();
  } catch (error) {
    console.error("Premium check error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  bio: text("bio"),
  occupation: text("occupation"),
  location: text("location"),
  isPremium: boolean("is_premium").default(false),
  profilePhoto: text("profile_photo"),
  photos: text("photos").array().default([]),
  interests: text("interests").array().default([]),
  latitude: real("latitude"),
  longitude: real("longitude"),
  dailyViewsUsed: integer("daily_views_used").default(0),
  lastViewReset: timestamp("last_view_reset").default(sql`now()`),
  lastActive: timestamp("last_active").default(sql`now()`),
  // Matching preferences
  ageRangeMin: integer("age_range_min").default(18),
  ageRangeMax: integer("age_range_max").default(35),
  maxDistance: integer("max_distance").default(25),
  // in kilometers
  dealBreakers: text("deal_breakers").array().default([]),
  lookingFor: text("looking_for").default("relationship"),
  // "relationship", "casual", "friendship"
  lifestyle: text("lifestyle").array().default([]),
  // "active", "homebody", "social", "career-focused"
  values: text("values").array().default([]),
  // "family", "travel", "adventure", "stability"
  meetReadiness: text("meet_readiness").default("flexible"),
  // "within_48h", "this_weekend", "after_coffee_chat", "flexible"
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Enhanced security fields
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  isPhotoVerified: boolean("is_photo_verified").default(false),
  isIdVerified: boolean("is_id_verified").default(false),
  phoneNumber: text("phone_number"),
  emailVerificationToken: text("email_verification_token"),
  phoneVerificationToken: text("phone_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  lastPasswordChange: timestamp("last_password_change").default(sql`now()`),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  privacySettings: text("privacy_settings").default("{}"),
  // JSON string for privacy preferences
  reportedCount: integer("reported_count").default(0),
  isBanned: boolean("is_banned").default(false),
  bannedUntil: timestamp("banned_until"),
  accountCreatedAt: timestamp("account_created_at").default(sql`now()`),
  lastIpAddress: text("last_ip_address"),
  deviceIds: text("device_ids").array().default([]),
  // Track known devices
  loginHistory: text("login_history").default("[]")
  // JSON array of login attempts
});
var swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id").notNull().references(() => users.id),
  swipedId: varchar("swiped_id").notNull().references(() => users.id),
  isLike: boolean("is_like").notNull(),
  isSuperLike: boolean("is_super_like").default(false),
  meetupPreference: text("meetup_preference"),
  // "instant", "planned", "unavailable"
  createdAt: timestamp("created_at").default(sql`now()`)
});
var matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  expiresAt: timestamp("expires_at").default(sql`now() + interval '72 hours'`),
  isExtended: boolean("is_extended").default(false),
  isFrozen: boolean("is_frozen").default(false),
  meetupConfirmed: boolean("meetup_confirmed").default(false),
  meetupTime: timestamp("meetup_time"),
  meetupLocation: text("meetup_location"),
  sharedEventId: varchar("shared_event_id"),
  // Event that brought them together
  hasMetInPerson: boolean("has_met_in_person").default(false)
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // 'workshop', 'volunteering', 'social', 'sports', 'cultural'
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").default(sql`now()`)
});
var postMeetReflections = pgTable("post_meet_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  wouldMeetAgain: boolean("would_meet_again").notNull(),
  connectionLevel: integer("connection_level").notNull(),
  // 1-5 scale
  conversationQuality: integer("conversation_quality").notNull(),
  // 1-5 scale
  sharedInterests: text("shared_interests").array().default([]),
  whatWorkedWell: text("what_worked_well"),
  improvementSuggestions: text("improvement_suggestions"),
  safetyRating: integer("safety_rating").notNull(),
  // 1-5 scale
  isVisible: boolean("is_visible").default(true),
  // Can be shared with match
  createdAt: timestamp("created_at").default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  age: true,
  bio: true,
  occupation: true,
  location: true,
  profilePhoto: true,
  photos: true,
  interests: true,
  latitude: true,
  longitude: true,
  ageRangeMin: true,
  ageRangeMax: true,
  maxDistance: true,
  dealBreakers: true,
  lookingFor: true,
  lifestyle: true,
  values: true,
  meetReadiness: true
});
var updateUserPreferencesSchema = z.object({
  ageRangeMin: z.number().min(18).max(100),
  ageRangeMax: z.number().min(18).max(100),
  maxDistance: z.number().min(1).max(100),
  dealBreakers: z.array(z.string()).default([]),
  lookingFor: z.enum(["relationship", "casual", "friendship"]),
  lifestyle: z.array(z.string()).default([]),
  values: z.array(z.string()).default([]),
  meetReadiness: z.enum(["within_48h", "this_weekend", "after_coffee_chat", "flexible"]).default("flexible")
}).refine((data) => data.ageRangeMax >= data.ageRangeMin, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["ageRangeMax"]
});
var loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
var insertSwipeSchema = createInsertSchema(swipes).pick({
  swipedId: true,
  isLike: true,
  isSuperLike: true,
  meetupPreference: true
});
var insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  content: true
});
var insertMatchSchema = createInsertSchema(matches).pick({
  user1Id: true,
  user2Id: true
});
var updateMatchSchema = createInsertSchema(matches).pick({
  isExtended: true,
  isFrozen: true,
  meetupConfirmed: true,
  meetupTime: true,
  meetupLocation: true,
  hasMetInPerson: true
}).partial();
var insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  category: true,
  date: true,
  location: true,
  maxParticipants: true
});
var insertEventParticipantSchema = createInsertSchema(eventParticipants).pick({
  eventId: true,
  userId: true
});
var insertPostMeetReflectionSchema = createInsertSchema(postMeetReflections).pick({
  matchId: true,
  wouldMeetAgain: true,
  connectionLevel: true,
  conversationQuality: true,
  sharedInterests: true,
  whatWorkedWell: true,
  improvementSuggestions: true,
  safetyRating: true,
  isVisible: true
});
var userReports = pgTable("user_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").notNull().references(() => users.id),
  matchId: varchar("match_id").references(() => matches.id),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  evidence: text("evidence").array().default([]),
  status: text("status").default("pending"),
  moderatorNotes: text("moderator_notes"),
  actionTaken: text("action_taken"),
  createdAt: timestamp("created_at").default(sql`now()`),
  resolvedAt: timestamp("resolved_at")
});
var securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  success: boolean("success").default(true),
  details: text("details").default("{}"),
  riskScore: integer("risk_score").default(0),
  location: text("location"),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var photoVerifications = pgTable("photo_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalPhotoUrl: text("original_photo_url").notNull(),
  verificationPhotoUrl: text("verification_photo_url").notNull(),
  status: text("status").default("pending"),
  confidence: real("confidence"),
  moderatorReviewed: boolean("moderator_reviewed").default(false),
  moderatorNotes: text("moderator_notes"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").default(sql`now()`),
  reviewedAt: timestamp("reviewed_at")
});
var blockedUsers = pgTable("blocked_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var trustedContacts = pgTable("trusted_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  relationship: text("relationship"),
  isEmergencyContact: boolean("is_emergency_contact").default(false),
  canReceiveLocationSharing: boolean("can_receive_location_sharing").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var safetyCheckIns = pgTable("safety_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  matchId: varchar("match_id").references(() => matches.id),
  checkInTime: timestamp("check_in_time").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  location: text("location"),
  status: text("status").default("scheduled"),
  emergencyTriggered: boolean("emergency_triggered").default(false),
  trustedContactNotified: boolean("trusted_contact_notified").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var videoChatSessions = pgTable("video_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  initiatorId: varchar("initiator_id").notNull().references(() => users.id),
  participantId: varchar("participant_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token").notNull().unique(),
  status: varchar("status").notNull().default("pending"),
  // pending, active, ended, declined, expired
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"),
  // in seconds
  callQuality: integer("call_quality"),
  // 1-5 scale post-call rating
  verifiedConnection: boolean("verified_connection").default(false),
  // If both users confirmed face verification
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var insertUserReportSchema = createInsertSchema(userReports).pick({
  reportedUserId: true,
  matchId: true,
  reason: true,
  description: true,
  evidence: true
});
var insertPhotoVerificationSchema = createInsertSchema(photoVerifications).pick({
  originalPhotoUrl: true,
  verificationPhotoUrl: true
});
var insertBlockedUserSchema = createInsertSchema(blockedUsers).pick({
  blockedUserId: true,
  reason: true
});
var insertTrustedContactSchema = createInsertSchema(trustedContacts).pick({
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  relationship: true,
  isEmergencyContact: true,
  canReceiveLocationSharing: true
});
var emergencyAlerts = pgTable("emergency_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  triggeredAt: timestamp("triggered_at").default(sql`now()`),
  location: text("location").notNull(),
  // JSON string with lat/lng and address
  alertType: text("alert_type").notNull(),
  // emergency, panic, help_needed
  status: text("status").notNull().default("active"),
  // active, resolved, false_alarm
  contactsNotified: text("contacts_notified").array().default([]),
  // Array of contact IDs
  additionalInfo: text("additional_info"),
  // Optional message from user
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id)
});
var ghostedUsers = pgTable("ghosted_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ghosterId: varchar("ghoster_id").notNull().references(() => users.id),
  // User who ghosted
  ghostedId: varchar("ghosted_id").notNull().references(() => users.id),
  // User being ghosted
  reason: text("reason"),
  // Optional reason for ghosting
  createdAt: timestamp("created_at").default(sql`now()`)
});
var dateCheckIns = pgTable("date_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  responseTime: timestamp("response_time"),
  status: text("status").notNull().default("pending"),
  // pending, safe, help_needed, missed
  location: text("location"),
  // JSON string with current location
  safetyRating: integer("safety_rating"),
  // 1-5 scale
  needsHelp: boolean("needs_help").default(false),
  emergencyTriggered: boolean("emergency_triggered").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var insertSafetyCheckInSchema = createInsertSchema(safetyCheckIns).pick({
  matchId: true,
  scheduledFor: true,
  location: true
});
var insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).pick({
  location: true,
  alertType: true,
  additionalInfo: true
});
var insertGhostedUserSchema = createInsertSchema(ghostedUsers).pick({
  ghostedId: true,
  reason: true
});
var insertDateCheckInSchema = createInsertSchema(dateCheckIns).pick({
  matchId: true,
  scheduledTime: true,
  location: true,
  safetyRating: true,
  needsHelp: true
});
var verifyEmailSchema = z.object({
  token: z.string().min(1)
});
var verifyPhoneSchema = z.object({
  token: z.string().length(6)
});
var resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});
var changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});
var enable2FASchema = z.object({
  secret: z.string().min(1),
  token: z.string().length(6)
});

// server/routes.ts
import { z as z2 } from "zod";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      if (!validateEmail(userData.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const passwordCheck = isStrongPassword(userData.password);
      if (!passwordCheck.isValid) {
        return res.status(400).json({
          message: "Password does not meet security requirements",
          issues: passwordCheck.issues
        });
      }
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        await logSecurityEvent({
          eventType: "registration_attempt_duplicate_username",
          req,
          success: false,
          details: { username: userData.username }
        });
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        await logSecurityEvent({
          eventType: "registration_attempt_duplicate_email",
          req,
          success: false,
          details: { email: userData.email }
        });
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const emailVerificationToken = generateVerificationToken();
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        emailVerificationToken,
        isEmailVerified: false,
        lastIpAddress: req.ip || "unknown",
        deviceIds: [],
        loginHistory: "[]",
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        reportedCount: 0,
        isBanned: false,
        privacySettings: JSON.stringify({
          showAge: true,
          showLocation: true,
          allowMessages: true,
          allowLocationSharing: false
        })
      });
      await logSecurityEvent({
        userId: user.id,
        eventType: "user_registration",
        req,
        success: true,
        details: { username: user.username, email: user.email }
      });
      const { password, emailVerificationToken: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        message: "Registration successful. Please check your email for verification."
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        await logSecurityEvent({
          eventType: "login_attempt_user_not_found",
          req,
          success: false,
          details: { username }
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (user.accountLockedUntil && /* @__PURE__ */ new Date() < new Date(user.accountLockedUntil)) {
        await logSecurityEvent({
          userId: user.id,
          eventType: "login_attempt_locked_account",
          req,
          success: false,
          details: { lockedUntil: user.accountLockedUntil }
        });
        return res.status(423).json({ message: "Account is temporarily locked" });
      }
      if (user.isBanned) {
        await logSecurityEvent({
          userId: user.id,
          eventType: "login_attempt_banned_account",
          req,
          success: false
        });
        const banMessage = user.bannedUntil ? `Account is banned until ${user.bannedUntil}` : "Account is permanently banned";
        return res.status(403).json({ message: banMessage });
      }
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockDuration = shouldLockAccount(newFailedAttempts) ? calculateLockDuration(newFailedAttempts) : 0;
        const accountLockedUntil = lockDuration > 0 ? new Date(Date.now() + lockDuration) : null;
        await storage.updateUser(user.id, {
          failedLoginAttempts: newFailedAttempts,
          accountLockedUntil
        });
        await logSecurityEvent({
          userId: user.id,
          eventType: "login_attempt_failed_password",
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
      await storage.updateUser(user.id, {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastActive: /* @__PURE__ */ new Date(),
        lastIpAddress: req.ip || "unknown"
      });
      if (user.twoFactorEnabled) {
        const accessToken2 = generateAccessToken(user.id);
        const refreshToken2 = generateRefreshToken(user.id);
        req.session.userId = user.id;
        req.session.accessToken = accessToken2;
        req.session.refreshToken = refreshToken2;
        req.session.loginTime = /* @__PURE__ */ new Date();
        req.session.lastActivity = /* @__PURE__ */ new Date();
        await logSecurityEvent({
          userId: user.id,
          eventType: "login_success_with_2fa",
          req,
          success: true,
          riskScore: calculateRiskScore(req, user)
        });
        const { password: _2, twoFactorSecret: twoFactorSecret2, emailVerificationToken: emailVerificationToken2, phoneVerificationToken: phoneVerificationToken2, passwordResetToken: passwordResetToken2, ...userWithoutSensitiveData2 } = user;
        return res.json({
          user: userWithoutSensitiveData2,
          accessToken: accessToken2,
          message: "Login successful"
        });
      }
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      req.session.userId = user.id;
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      req.session.loginTime = /* @__PURE__ */ new Date();
      req.session.lastActivity = /* @__PURE__ */ new Date();
      await logSecurityEvent({
        userId: user.id,
        eventType: "login_success",
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
      console.error("Login error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      await logSecurityEvent({
        userId: user.id,
        eventType: "user_logout",
        req,
        success: true
      });
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
      });
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discover/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { useCompatibilityMatching, meetReadiness } = req.query;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.resetDailyViewsIfNeeded(userId);
      const updatedUser = await storage.getUser(userId);
      const dailyLimit = updatedUser?.isPremium ? Infinity : 15;
      if ((updatedUser?.dailyViewsUsed || 0) >= dailyLimit) {
        return res.status(429).json({
          message: "Daily view limit reached",
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1e3 - (updatedUser?.dailyViewsUsed || 0) * 60 * 60 * 1e3)
        });
      }
      const users2 = await storage.getFilteredUsers(userId, {
        isPremium: updatedUser?.isPremium,
        useCompatibilityMatching: useCompatibilityMatching === "true",
        meetReadiness
      });
      const limitedUsers = users2.slice(0, 10).map((u) => {
        const { password, ...userWithoutPassword } = u;
        console.log("Returning user:", u.name, "with timeline alignment:", u.timelineAlignment, "reason:", u.timelineReason);
        return userWithoutPassword;
      });
      console.log("Final response will contain timeline data:", limitedUsers.some((u) => u.timelineAlignment !== void 0));
      console.log("Sample user timeline data:", limitedUsers[0] ? {
        name: limitedUsers[0].name,
        timelineAlignment: limitedUsers[0].timelineAlignment,
        timelineReason: limitedUsers[0].timelineReason
      } : "No users");
      res.json({ users: limitedUsers });
    } catch (error) {
      console.error("Discovery error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discover/compatible/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.resetDailyViewsIfNeeded(userId);
      const updatedUser = await storage.getUser(userId);
      const dailyLimit = updatedUser?.isPremium ? Infinity : 15;
      if ((updatedUser?.dailyViewsUsed || 0) >= dailyLimit) {
        return res.status(429).json({
          message: "Daily view limit reached",
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1e3 - (updatedUser?.dailyViewsUsed || 0) * 60 * 60 * 1e3)
        });
      }
      const swipes2 = await storage.getUserSwipes(userId);
      const swipedIds = swipes2.map((s) => s.swipedId);
      const discoverableUsers = await storage.getDiscoverableUsers(userId, swipedIds);
      const compatibleUsers = discoverableUsers.slice(0, 10).map((u) => {
        const distance = Math.random() * 5;
        let compatibilityScore = 50;
        const compatibilityReasons = [];
        if (user.preferences?.ageRange) {
          const [minAge, maxAge] = user.preferences.ageRange;
          if (u.age >= minAge && u.age <= maxAge) {
            compatibilityScore += 15;
            compatibilityReasons.push("In your preferred age range");
          }
        }
        if (user.interests && u.interests) {
          const commonInterests = user.interests.filter(
            (interest) => u.interests?.includes(interest)
          );
          if (commonInterests.length > 0) {
            compatibilityScore += commonInterests.length * 5;
            compatibilityReasons.push(`${commonInterests.length} shared interests: ${commonInterests.slice(0, 2).join(", ")}`);
          }
        }
        if (user.dailyActivities && u.dailyActivities) {
          const commonActivities = user.dailyActivities.filter(
            (activity) => u.dailyActivities?.includes(activity)
          );
          if (commonActivities.length > 0) {
            compatibilityScore += commonActivities.length * 3;
            compatibilityReasons.push(`Similar daily activities`);
          }
        }
        if (user.preferences?.relationshipGoals && user.preferences.relationshipGoals === u.preferences?.relationshipGoals) {
          compatibilityScore += 20;
          compatibilityReasons.push("Same relationship goals");
        }
        compatibilityScore = Math.min(99, compatibilityScore);
        return {
          ...u,
          distance: Number(distance.toFixed(1)),
          compatibilityScore,
          compatibilityReasons,
          password: void 0
          // Remove password from response
        };
      }).sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
      res.json({ users: compatibleUsers });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/swipe", async (req, res) => {
    try {
      const swipeData = insertSwipeSchema.parse(req.body);
      const { userId } = req.query;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ message: "User ID required" });
      }
      const alreadySwiped = await storage.hasUserSwiped(userId, swipeData.swipedId);
      if (alreadySwiped) {
        return res.status(400).json({ message: "Already swiped on this user" });
      }
      await storage.updateDailyViews(userId);
      const swipe = await storage.createSwipe({
        ...swipeData,
        swiperId: userId
      });
      let match = null;
      if (swipeData.isLike) {
        const isMatch = await storage.checkForMatch(userId, swipeData.swipedId);
        if (isMatch) {
          match = await storage.createMatch(userId, swipeData.swipedId);
        }
      }
      res.json({ swipe, match });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/matches/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const matches2 = await storage.getUserMatches(userId);
      const matchesWithUsers = await Promise.all(
        matches2.map(async (match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          if (!otherUser) return null;
          const { password, ...userWithoutPassword } = otherUser;
          return {
            ...match,
            otherUser: userWithoutPassword
          };
        })
      );
      const filteredMatches = matchesWithUsers.filter((m) => m !== null);
      res.json({ matches: filteredMatches });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/messages/:matchId", async (req, res) => {
    try {
      const { matchId } = req.params;
      const messages2 = await storage.getMatchMessages(matchId);
      res.json({ messages: messages2 });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const { userId } = req.query;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ message: "User ID required" });
      }
      const message = await storage.createMessage({
        ...messageData,
        senderId: userId
      });
      res.json({ message });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/match/:matchId", async (req, res) => {
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
  app2.get("/api/discover/compatible/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.resetDailyViewsIfNeeded(userId);
      const updatedUser = await storage.getUser(userId);
      const dailyLimit = updatedUser?.isPremium ? Infinity : 15;
      if ((updatedUser?.dailyViewsUsed || 0) >= dailyLimit) {
        return res.status(429).json({
          message: "Daily view limit reached",
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1e3 - (updatedUser?.dailyViewsUsed || 0) * 60 * 60 * 1e3)
        });
      }
      const swipes2 = await storage.getUserSwipes(userId);
      const swipedIds = swipes2.map((s) => s.swipedId);
      const compatibleUsers = await storage.getCompatibleUsers(userId, swipedIds);
      const usersWithoutPasswords = compatibleUsers.slice(0, 10).map((u) => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/user/preferences/:userId", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user/:userId", async (req, res) => {
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
  app2.put("/api/user/:userId", async (req, res) => {
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
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd"
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/create-subscription", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.stripeSubscriptionId) {
        const subscription2 = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription2.status === "active" || subscription2.status === "trialing") {
          return res.json({
            subscriptionId: subscription2.id,
            status: subscription2.status,
            clientSecret: subscription2.latest_invoice?.payment_intent?.client_secret
          });
        }
      }
      if (!user.email) {
        return res.status(400).json({ message: "No user email on file" });
      }
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
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Criss-Cross Premium",
              description: "Unlimited swipes, enhanced matching, priority discovery, match extensions, and timeline filters"
            },
            unit_amount: 999,
            // $9.99 per month
            recurring: {
              interval: "month"
            }
          }
        }],
        trial_period_days: 7,
        // 7-day free trial
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
        metadata: { userId: user.id }
      });
      await storage.updateUserStripeInfo(user.id, {
        customerId: customer.id,
        subscriptionId: subscription.id
      });
      await storage.updateUser(user.id, { isPremium: true });
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        trial_end: subscription.trial_end
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });
  app2.get("/api/subscription/status", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.json({
          hasSubscription: false,
          isPremium: false,
          status: "inactive"
        });
      }
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      res.json({
        hasSubscription: true,
        isPremium: isActive,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
      });
    } catch (error) {
      console.error("Subscription status error:", error);
      res.status(500).json({ error: { message: error.message } });
    }
  });
  app2.post("/api/subscription/cancel", authenticateToken, async (req, res) => {
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
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      res.status(500).json({ error: { message: error.message } });
    }
  });
  app2.post("/api/subscription/reactivate", authenticateToken, async (req, res) => {
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
    } catch (error) {
      console.error("Subscription reactivation error:", error);
      res.status(500).json({ error: { message: error.message } });
    }
  });
  app2.post("/api/webhooks/stripe", async (req, res) => {
    let event;
    try {
      event = req.body;
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }
    switch (event.type) {
      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        console.log("Payment succeeded for invoice:", invoice.id);
        if (invoice.customer && invoice.subscription) {
          try {
            const customer = await stripe.customers.retrieve(invoice.customer);
            if (customer && !customer.deleted && customer.metadata?.userId) {
              await storage.updateUser(customer.metadata.userId, { isPremium: true });
              console.log(`Updated premium status for user ${customer.metadata.userId}`);
            }
          } catch (error) {
            console.error("Error updating user premium status:", error);
          }
        }
        break;
      case "invoice.payment_failed":
        console.log("Payment failed for invoice:", event.data.object.id);
        break;
      case "customer.subscription.deleted":
        const deletedSub = event.data.object;
        console.log("Subscription canceled:", deletedSub.id);
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
            console.error("Error removing premium status:", error);
          }
        }
        break;
      case "customer.subscription.updated":
        const updatedSub = event.data.object;
        console.log("Subscription updated:", updatedSub.id);
        if (updatedSub.customer) {
          try {
            const customer = await stripe.customers.retrieve(updatedSub.customer);
            if (customer && !customer.deleted && customer.metadata?.userId) {
              const isActive = updatedSub.status === "active" || updatedSub.status === "trialing";
              await storage.updateUser(customer.metadata.userId, { isPremium: isActive });
              console.log(`Updated premium status to ${isActive} for user ${customer.metadata.userId}`);
            }
          } catch (error) {
            console.error("Error updating premium status:", error);
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  });
  app2.post("/api/safety/emergency-alert", authenticateToken, async (req, res) => {
    try {
      const { location, alertType, additionalInfo } = req.body;
      if (!location || !alertType) {
        return res.status(400).json({ message: "Location and alert type are required" });
      }
      const trustedContacts2 = await storage.getUserTrustedContacts(req.user.id);
      if (trustedContacts2.length === 0) {
        return res.status(400).json({
          message: "No trusted contacts found. Please add trusted contacts first.",
          requiresSetup: true
        });
      }
      const alert = await storage.createEmergencyAlert({
        userId: req.user.id,
        location,
        alertType,
        additionalInfo
      });
      const contactIds = trustedContacts2.map((contact) => contact.id);
      console.log(`Emergency alert triggered by ${req.user.username}:`, {
        alertType,
        location,
        contactsToNotify: trustedContacts2.length,
        additionalInfo
      });
      res.json({
        message: "Emergency alert sent successfully",
        alert: {
          ...alert,
          contactsNotified: contactIds
        }
      });
    } catch (error) {
      console.error("Error creating emergency alert:", error);
      res.status(500).json({ message: "Failed to send emergency alert" });
    }
  });
  app2.post("/api/safety/ghost-profile", authenticateToken, async (req, res) => {
    try {
      const { ghostedId, reason } = req.body;
      if (!ghostedId) {
        return res.status(400).json({ message: "User ID to ghost is required" });
      }
      const isAlreadyGhosted = await storage.isUserGhosted(req.user.id, ghostedId);
      if (isAlreadyGhosted) {
        return res.status(400).json({ message: "User is already ghosted" });
      }
      const ghostedUser = await storage.ghostUser(req.user.id, ghostedId, reason);
      res.json({
        message: "Profile ghosted successfully",
        ghostedUser
      });
    } catch (error) {
      console.error("Error ghosting profile:", error);
      res.status(500).json({ message: "Failed to ghost profile" });
    }
  });
  app2.post("/api/safety/date-checkin", authenticateToken, async (req, res) => {
    try {
      const { matchId, status, location, needsHelp, safetyRating } = req.body;
      if (!matchId || !status) {
        return res.status(400).json({ message: "Match ID and status are required" });
      }
      const checkIn = await storage.createDateCheckIn({
        userId: req.user.id,
        matchId,
        scheduledTime: /* @__PURE__ */ new Date(),
        location,
        needsHelp: needsHelp || false,
        safetyRating
      });
      if (needsHelp) {
        console.log(`Date check-in: ${req.user.username} requested help during meetup`);
      }
      res.json({
        message: needsHelp ? "Help request sent" : "Check-in recorded",
        checkIn,
        status: needsHelp ? "help_needed" : "safe"
      });
    } catch (error) {
      console.error("Error creating date check-in:", error);
      res.status(500).json({ message: "Failed to record check-in" });
    }
  });
  app2.get("/api/safety/trusted-contacts", authenticateToken, async (req, res) => {
    try {
      const contacts = await storage.getUserTrustedContacts(req.user.id);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching trusted contacts:", error);
      res.status(500).json({ message: "Failed to fetch trusted contacts" });
    }
  });
  app2.get("/api/safety/emergency-alerts", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getUserEmergencyAlerts(req.user.id);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching emergency alerts:", error);
      res.status(500).json({ message: "Failed to fetch emergency alerts" });
    }
  });
  app2.post("/api/safety/resolve-alert/:alertId", authenticateToken, async (req, res) => {
    try {
      const { alertId } = req.params;
      const resolvedAlert = await storage.resolveEmergencyAlert(alertId, req.user.id);
      if (!resolvedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({
        message: "Alert resolved successfully",
        alert: resolvedAlert
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });
  app2.post("/api/video-chat/initiate", authenticateToken, async (req, res) => {
    try {
      const { matchId, participantId } = req.body;
      if (!matchId || !participantId) {
        return res.status(400).json({ message: "Match ID and participant ID are required" });
      }
      const match = await storage.getMatch(matchId);
      if (!match || match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to initiate call for this match" });
      }
      const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const session2 = await storage.createVideoChatSession({
        matchId,
        initiatorId: req.user.id,
        participantId,
        sessionToken,
        status: "pending"
      });
      res.json({
        sessionId: session2.id,
        sessionToken,
        message: "Video chat session initiated"
      });
    } catch (error) {
      console.error("Error initiating video chat:", error);
      res.status(500).json({ message: "Failed to initiate video chat" });
    }
  });
  app2.post("/api/video-chat/accept", authenticateToken, async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session2 = await storage.updateVideoChatSession(sessionId, {
        status: "active",
        startedAt: /* @__PURE__ */ new Date()
      });
      if (!session2) {
        return res.status(404).json({ message: "Video chat session not found" });
      }
      res.json({ message: "Video chat accepted", session: session2 });
    } catch (error) {
      console.error("Error accepting video chat:", error);
      res.status(500).json({ message: "Failed to accept video chat" });
    }
  });
  app2.post("/api/video-chat/end", authenticateToken, async (req, res) => {
    try {
      const { matchId, duration, callQuality } = req.body;
      const sessions = await storage.getVideoChatSessions(matchId);
      const activeSession = sessions.find((s) => s.status === "active");
      if (activeSession) {
        await storage.updateVideoChatSession(activeSession.id, {
          status: "ended",
          endedAt: /* @__PURE__ */ new Date(),
          duration,
          callQuality
        });
      }
      res.json({ message: "Video chat ended successfully" });
    } catch (error) {
      console.error("Error ending video chat:", error);
      res.status(500).json({ message: "Failed to end video chat" });
    }
  });
  app2.get("/api/video-chat/sessions/:matchId", authenticateToken, async (req, res) => {
    try {
      const { matchId } = req.params;
      const sessions = await storage.getVideoChatSessions(matchId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching video chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch video chat sessions" });
    }
  });
  app2.use("/api/premium/*", requirePremium);
  app2.post("/api/matches/:matchId/extend", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/matches/:matchId/freeze", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/matches/:matchId/unfreeze", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/matches/:matchId/confirm-meetup", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/matches/active/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const activeMatches = await storage.getActiveMatches(userId);
      res.json({ matches: activeMatches });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const events2 = await storage.getActiveEvents();
      res.json({ events: events2 });
    } catch (error) {
      console.error("Events error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/events/:eventId/join", async (req, res) => {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      const participant = await storage.joinEvent(eventId, userId);
      res.json({ participant });
    } catch (error) {
      console.error("Join event error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });
  app2.get("/api/users/:userId/shared-event-matches", async (req, res) => {
    try {
      const { userId } = req.params;
      const matches2 = await storage.findSharedEventMatches(userId);
      res.json({ matches: matches2 });
    } catch (error) {
      console.error("Shared event matches error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/matches/:matchId/reflection", async (req, res) => {
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
      console.error("Create reflection error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/matches/:matchId/met-in-person", async (req, res) => {
    try {
      const { matchId } = req.params;
      const match = await storage.markMatchAsMetInPerson(matchId);
      res.json({ match });
    } catch (error) {
      console.error("Mark met in person error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  setupVideoChat(httpServer);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
