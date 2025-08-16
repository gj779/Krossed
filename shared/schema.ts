import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
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
  // Identity and preferences
  gender: text("gender").notNull(), // "man", "woman", "non-binary"
  sexualOrientation: text("sexual_orientation").notNull(), // "straight", "gay", "bisexual", "pansexual"
  interestedInGenders: text("interested_in_genders").array().notNull(), // ["man"], ["woman"], ["man", "woman"], etc.
  // Matching preferences
  ageRangeMin: integer("age_range_min").default(18),
  ageRangeMax: integer("age_range_max").default(35),
  maxDistance: integer("max_distance").default(25), // in kilometers
  dealBreakers: text("deal_breakers").array().default([]),
  lookingFor: text("looking_for").default("relationship"), // "relationship", "casual", "friendship"
  lifestyle: text("lifestyle").array().default([]), // "active", "homebody", "social", "career-focused"
  values: text("values").array().default([]), // "family", "travel", "adventure", "stability"
  meetReadiness: text("meet_readiness").default("flexible"), // "within_48h", "this_weekend", "after_coffee_chat", "flexible"
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
  privacySettings: text("privacy_settings").default('{}'), // JSON string for privacy preferences
  reportedCount: integer("reported_count").default(0),
  isBanned: boolean("is_banned").default(false),
  bannedUntil: timestamp("banned_until"),
  accountCreatedAt: timestamp("account_created_at").default(sql`now()`),
  lastIpAddress: text("last_ip_address"),
  deviceIds: text("device_ids").array().default([]), // Track known devices
  loginHistory: text("login_history").default('[]'), // JSON array of login attempts
});

export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id").notNull().references(() => users.id),
  swipedId: varchar("swiped_id").notNull().references(() => users.id),
  isLike: boolean("is_like").notNull(),
  isSuperLike: boolean("is_super_like").default(false),
  meetupPreference: text("meetup_preference"), // "instant", "planned", "unavailable"
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const matches = pgTable("matches", {
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
  sharedEventId: varchar("shared_event_id"), // Event that brought them together
  hasMetInPerson: boolean("has_met_in_person").default(false),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content"),
  messageType: varchar("message_type", { enum: ["text", "voice"] }).default("text").notNull(),
  voiceUrl: varchar("voice_url"),
  voiceDuration: integer("voice_duration"), // Duration in seconds
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'workshop', 'volunteering', 'social', 'sports', 'cultural'
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").default(sql`now()`),
});

export const postMeetReflections = pgTable("post_meet_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  wouldMeetAgain: boolean("would_meet_again").notNull(),
  connectionLevel: integer("connection_level").notNull(), // 1-5 scale
  conversationQuality: integer("conversation_quality").notNull(), // 1-5 scale
  sharedInterests: text("shared_interests").array().default([]),
  whatWorkedWell: text("what_worked_well"),
  improvementSuggestions: text("improvement_suggestions"),
  safetyRating: integer("safety_rating").notNull(), // 1-5 scale
  isVisible: boolean("is_visible").default(true), // Can be shared with match
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
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
  gender: true,
  sexualOrientation: true,
  interestedInGenders: true,
  ageRangeMin: true,
  ageRangeMax: true,
  maxDistance: true,
  dealBreakers: true,
  lookingFor: true,
  lifestyle: true,
  values: true,
  meetReadiness: true,
});

export const updateUserPreferencesSchema = z.object({
  ageRangeMin: z.number().min(18).max(100),
  ageRangeMax: z.number().min(18).max(100),
  maxDistance: z.number().min(1).max(100),
  dealBreakers: z.array(z.string()).default([]),
  lookingFor: z.enum(["relationship", "casual", "friendship"]),
  lifestyle: z.array(z.string()).default([]),
  values: z.array(z.string()).default([]),
  meetReadiness: z.enum(["within_48h", "this_weekend", "after_coffee_chat", "flexible"]).default("flexible"),
}).refine(data => data.ageRangeMax >= data.ageRangeMin, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["ageRangeMax"],
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertSwipeSchema = createInsertSchema(swipes).pick({
  swipedId: true,
  isLike: true,
  isSuperLike: true,
  meetupPreference: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  content: true,
  messageType: true,
  voiceUrl: true,
  voiceDuration: true,
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  user1Id: true,
  user2Id: true,
});

export const updateMatchSchema = createInsertSchema(matches).pick({
  isExtended: true,
  isFrozen: true,
  meetupConfirmed: true,
  meetupTime: true,
  meetupLocation: true,
  hasMetInPerson: true,
}).partial();

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  category: true,
  date: true,
  location: true,
  maxParticipants: true,
});

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).pick({
  eventId: true,
  userId: true,
});

export const insertPostMeetReflectionSchema = createInsertSchema(postMeetReflections).pick({
  matchId: true,
  wouldMeetAgain: true,
  connectionLevel: true,
  conversationQuality: true,
  sharedInterests: true,
  whatWorkedWell: true,
  improvementSuggestions: true,
  safetyRating: true,
  isVisible: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;
export type PostMeetReflection = typeof postMeetReflections.$inferSelect;
export type InsertPostMeetReflection = z.infer<typeof insertPostMeetReflectionSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;

// Enhanced user type with compatibility score for matching
export type UserWithCompatibility = User & {
  compatibilityScore?: number;
  compatibilityReasons?: string[];
  distance?: number;
  timelineAlignment?: number; // 0-100 score for meet readiness alignment
  timelineReason?: string;
};

// New security-related tables
export const userReports = pgTable("user_reports", {
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
  resolvedAt: timestamp("resolved_at"),
});

export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  success: boolean("success").default(true),
  details: text("details").default('{}'),
  riskScore: integer("risk_score").default(0),
  location: text("location"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const photoVerifications = pgTable("photo_verifications", {
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
  reviewedAt: timestamp("reviewed_at"),
});

export const blockedUsers = pgTable("blocked_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const trustedContacts = pgTable("trusted_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  relationship: text("relationship"),
  isEmergencyContact: boolean("is_emergency_contact").default(false),
  canReceiveLocationSharing: boolean("can_receive_location_sharing").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const safetyCheckIns = pgTable("safety_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  matchId: varchar("match_id").references(() => matches.id),
  checkInTime: timestamp("check_in_time").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  location: text("location"),
  status: text("status").default("scheduled"),
  emergencyTriggered: boolean("emergency_triggered").default(false),
  trustedContactNotified: boolean("trusted_contact_notified").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Video chat sessions for verified face-to-face conversations before meetups
export const videoChatSessions = pgTable("video_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  initiatorId: varchar("initiator_id").notNull().references(() => users.id),
  participantId: varchar("participant_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, active, ended, declined, expired
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // in seconds
  callQuality: integer("call_quality"), // 1-5 scale post-call rating
  verifiedConnection: boolean("verified_connection").default(false), // If both users confirmed face verification
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Security-related types
export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = typeof userReports.$inferInsert;
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof securityLogs.$inferInsert;
export type PhotoVerification = typeof photoVerifications.$inferSelect;
export type InsertPhotoVerification = typeof photoVerifications.$inferInsert;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertBlockedUser = typeof blockedUsers.$inferInsert;
export type TrustedContact = typeof trustedContacts.$inferSelect;
export type InsertTrustedContact = typeof trustedContacts.$inferInsert;
export type SafetyCheckIn = typeof safetyCheckIns.$inferSelect;
export type InsertSafetyCheckIn = typeof safetyCheckIns.$inferInsert;
export type VideoChatSession = typeof videoChatSessions.$inferSelect;
export type InsertVideoChatSession = typeof videoChatSessions.$inferInsert;

// Security-related Zod schemas
export const insertUserReportSchema = createInsertSchema(userReports).pick({
  reportedUserId: true,
  matchId: true,
  reason: true,
  description: true,
  evidence: true,
});

export const insertPhotoVerificationSchema = createInsertSchema(photoVerifications).pick({
  originalPhotoUrl: true,
  verificationPhotoUrl: true,
});

export const insertBlockedUserSchema = createInsertSchema(blockedUsers).pick({
  blockedUserId: true,
  reason: true,
});

export const insertTrustedContactSchema = createInsertSchema(trustedContacts).pick({
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  relationship: true,
  isEmergencyContact: true,
  canReceiveLocationSharing: true,
});

// Emergency alerts table
export const emergencyAlerts = pgTable("emergency_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  triggeredAt: timestamp("triggered_at").default(sql`now()`),
  location: text("location").notNull(), // JSON string with lat/lng and address
  alertType: text("alert_type").notNull(), // emergency, panic, help_needed, one_click_share
  status: text("status").notNull().default("active"), // active, resolved, false_alarm
  contactsNotified: text("contacts_notified").array().default([]), // Array of contact IDs
  additionalInfo: text("additional_info"), // Optional message from user
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  matchId: varchar("match_id").references(() => matches.id), // For date-related alerts
  shareDetails: text("share_details"), // JSON with additional sharing info
  isOneClickShare: boolean("is_one_click_share").default(false)
});

// One-click emergency share tracking
export const emergencyShares = pgTable("emergency_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  matchId: varchar("match_id").references(() => matches.id),
  triggeredAt: timestamp("triggered_at").default(sql`now()`),
  shareType: text("share_type").notNull(), // location_only, full_details, panic_mode
  location: text("location").notNull(), // JSON string with lat/lng and address
  contactsSharedWith: text("contacts_shared_with").array().default([]), // Array of contact IDs/phones
  dateDetails: text("date_details"), // JSON with match/date information
  autoResolveAt: timestamp("auto_resolve_at"), // When to auto-resolve if no response
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Ghosted users table for profile hiding
export const ghostedUsers = pgTable("ghosted_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ghosterId: varchar("ghoster_id").notNull().references(() => users.id), // User who ghosted
  ghostedId: varchar("ghosted_id").notNull().references(() => users.id), // User being ghosted
  reason: text("reason"), // Optional reason for ghosting
  createdAt: timestamp("created_at").default(sql`now()`)
});

// In-date check-ins for safety during meetups
export const dateCheckIns = pgTable("date_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  responseTime: timestamp("response_time"),
  status: text("status").notNull().default("pending"), // pending, safe, help_needed, missed
  location: text("location"), // JSON string with current location
  safetyRating: integer("safety_rating"), // 1-5 scale
  needsHelp: boolean("needs_help").default(false),
  emergencyTriggered: boolean("emergency_triggered").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});

export const insertSafetyCheckInSchema = createInsertSchema(safetyCheckIns).pick({
  matchId: true,
  scheduledFor: true,
  location: true,
});

// Safety toolkit schemas
export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).pick({
  location: true,
  alertType: true,
  additionalInfo: true,
  matchId: true,
  shareDetails: true,
  isOneClickShare: true,
});

export const insertEmergencyShareSchema = createInsertSchema(emergencyShares).pick({
  matchId: true,
  shareType: true,
  location: true,
  dateDetails: true,
  autoResolveAt: true,
});

export const insertGhostedUserSchema = createInsertSchema(ghostedUsers).pick({
  ghostedId: true,
  reason: true,
});

export const insertDateCheckInSchema = createInsertSchema(dateCheckIns).pick({
  matchId: true,
  scheduledTime: true,
  location: true,
  safetyRating: true,
  needsHelp: true,
});

// Safety toolkit types
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type EmergencyShare = typeof emergencyShares.$inferSelect;
export type InsertEmergencyShare = z.infer<typeof insertEmergencyShareSchema>;
export type GhostedUser = typeof ghostedUsers.$inferSelect;
export type InsertGhostedUser = z.infer<typeof insertGhostedUserSchema>;
export type DateCheckIn = typeof dateCheckIns.$inferSelect;
export type InsertDateCheckIn = z.infer<typeof insertDateCheckInSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const verifyPhoneSchema = z.object({
  token: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const enable2FASchema = z.object({
  secret: z.string().min(1),
  token: z.string().length(6),
});
