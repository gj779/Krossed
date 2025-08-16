# Krossed Dating App

## Overview

Krossed is a proximity-based dating application built with React and Express.js that fundamentally differs from traditional dating apps by prioritizing real-world connections over digital communication. The app uses the tagline "Crossing paths does not mean it has to end" and focuses on encouraging in-person meetings through proximity-based matching with limited options. Key principles include restricting digital messaging to promote face-to-face conversations and reducing choice overload by showing only nearby potential matches. The app features a card-based swipe interface, smart compatibility matching, location-aware discovery, and premium features for enhanced connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Updated: August 7, 2025)

✓ **Comprehensive Data Encryption & Security Implementation**: Advanced multi-layer security system with field-level encryption
✓ **AES-256-GCM Encryption**: Personal data encrypted at rest using industry-standard encryption with salt-based key derivation
✓ **Data Classification System**: Four-tier sensitivity classification (public, personal, sensitive, confidential) for targeted protection
✓ **Enhanced Security Middleware**: Helmet security headers, rate limiting, input validation, and CORS protection
✓ **Advanced Authentication**: Improved JWT tokens, 2FA support, device fingerprinting, and risk assessment
✓ **Security Logging**: Comprehensive audit trail with data anonymization for privacy compliance
✓ **Message Content Encryption**: End-to-end encryption for all private communications between users
✓ **Account Protection**: Progressive lockout system, failed login tracking, and account verification layers
✓ **Security Headers**: Content Security Policy, XSS protection, clickjacking prevention, and HTTPS enforcement
✓ **Data Anonymization**: PII scrubbing in logs and security events for privacy protection
✓ **Gender-Based Matching System**: Complete gender and sexual orientation matching with mutual preference filtering
✓ **UI/UX Mobile Optimization**: Improved proportions, spacing, and mobile-responsive design across all components
✓ **Comprehensive Security Testing**: All security features tested and validated - authentication, authorization, encryption, rate limiting, injection prevention
✓ **Security Monitoring**: Real-time audit logging with data anonymization and risk assessment capabilities
✓ **Complete Authentication Flow Fix**: Removed all mock data seeding and fixed user registration/login cycle
✓ **Clean Storage System**: App now starts with empty database requiring proper user registration
✓ **Schema Fixes**: Added gender and sexual orientation fields to registration form and InsertUser schema
✓ **LSP Diagnostics Clean**: Resolved all TypeScript errors and duplicate imports in routes and storage
✓ **Comprehensive Branding Update**: Complete rebranding from "Criss-Cross" to "Krossed" across all components, pages, documentation, and UI elements
✓ **Deployment Configuration**: Added comprehensive app.json file with environment variables, addons, and deployment settings for production deployment

## Core App Philosophy

- **Limit digital communication**: Encourage real-world meetings over endless texting
- **Proximity-focused**: Reduce choice overload by showing only nearby potential matches
- **Quality over quantity**: Fewer, more meaningful connections based on location and compatibility
- **In-person emphasis**: Design features that guide users toward face-to-face interactions
- **72-hour meetup window**: Matches expire after 72 hours unless meetup is confirmed to encourage decisive action
- **Premium match management**: Advanced tools for extending, freezing, and scheduling meetups

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: In-memory storage with plans for PostgreSQL session store
- **API Design**: RESTful endpoints with consistent JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Enhanced Security & Authentication System
- **Multi-Layer Authentication**: JWT tokens with refresh mechanism, 2FA support, and session management
- **Advanced Password Security**: bcrypt hashing with increased salt rounds (14), strong password validation
- **Account Protection**: Progressive lockout system, failed login tracking, device fingerprinting
- **Security Monitoring**: Real-time risk assessment, suspicious pattern detection, comprehensive audit logging
- **Data Encryption**: AES-256-GCM encryption for sensitive data with classification-based protection levels
- **Privacy Protection**: Data anonymization in logs, PII scrubbing, and secure data deletion capabilities

### Data Layer
- **Primary Database**: PostgreSQL with connection via @neondatabase/serverless
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Data Models**: Users, swipes, matches, and messages with proper foreign key relationships
- **Storage Strategy**: Memory storage for development with PostgreSQL for production

### UI/UX Design
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme Support**: CSS custom properties for light/dark mode compatibility
- **Mobile-First**: Responsive design optimized for mobile dating app experience
- **Animations**: CSS transitions and transforms for smooth swipe interactions
- **Icons**: Lucide React icon library for consistent visual elements

### Core Features Implementation
- **Swipe Mechanics**: Custom useSwipe hook with mouse/touch gesture support
- **Real-time Updates**: Query invalidation for immediate UI updates
- **Location Services**: Geolocation API integration with manual fallback
- **Premium Features**: Subscription model with feature gating
- **File Uploads**: Profile photo management with placeholder system
- **Advanced Matching**: Compatibility scoring algorithm with user preferences
- **Smart Discovery**: Toggle between standard and compatibility-based matching
- **User Preferences**: Age range, distance, deal breakers, lifestyle, and values filtering
- **In-App Safety Toolkit**: Comprehensive safety features for user protection during dates

### Advanced Matching System
- **Compatibility Algorithm**: Multi-factor scoring system (age, distance, interests, lifestyle, values)
- **Deal Breakers**: Automatic filtering based on user-defined incompatibilities
- **Preference Management**: Comprehensive user preference settings for matching criteria
- **Smart Matching Toggle**: Users can switch between random and compatibility-based discovery
- **Compatibility Display**: Visual compatibility scores and reasons shown on profile cards
- **Distance Calculation**: Real-time distance calculation using Haversine formula

### 72-Hour Match Countdown System
- **Match Expiration**: All matches automatically expire 72 hours after creation unless meetup is confirmed
- **Countdown Display**: Real-time countdown timer showing remaining time for each match
- **Premium Extensions**: Premium users can extend countdown once by 24 hours per match
- **Travel Freeze**: Premium users can freeze match timers while traveling
- **Auto-Schedule**: Premium feature for automatic meetup scheduling based on availability
- **Expired Match Handling**: Expired matches are visually distinguished and marked as closed
- **Meetup Confirmation**: Users can confirm meetup time and location to stop countdown

### Intent Filter by Meet Readiness (Premium Feature)
- **Timeline Preferences**: Users can set their meet readiness preference (within 48 hours, this weekend, after coffee chat, flexible)
- **Premium Filtering**: Premium users get prioritized matches based on compatible meeting timelines
- **Timeline Alignment Scoring**: Visual compatibility scores (0-100%) showing how well users' meeting preferences align
- **Alignment Display**: Premium users see timeline alignment scores and explanations on profile cards
- **Preference Management**: Meet readiness settings integrated into user preferences with premium badge
- **Smart Sorting**: Premium discovery results sorted by timeline alignment for optimal matches

### In-App Safety Toolkit
- **Emergency Alerts**: One-click emergency alert system with live location sharing to trusted contacts
- **Profile Ghosting**: Permanently hide profile from specific users after bad experiences with mutual blocking
- **Date Check-ins**: Automated safety check-ins during first meetups with escalation options
- **Trusted Contacts Management**: System for managing emergency contacts who receive safety notifications
- **Safety History**: Complete log of all safety activities, check-ins, and alerts for user reference
- **Ghosting Protection**: Discovery filtering automatically excludes ghosted users from re-matching and profile viewing
- **Integrated Safety Access**: Safety toolkit accessible directly from matches page and dedicated safety page

### Video Chat Functionality
- **Verified Face-to-Face Conversations**: WebRTC-based video calls between matched users before meeting in person
- **Call Quality Ratings**: Post-call rating system to improve matching and user experience
- **Real-time Communication**: Socket.IO WebSocket server for call signaling and connection management
- **Safety Integration**: Video chats build trust and verify user identity before physical meetups
- **Session Management**: Complete tracking of call duration, participants, and call history
- **Trust Building**: Face verification through video calls aligns with app's real-world connection philosophy

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting via @neondatabase/serverless
- **Connection Pooling**: Built-in connection management for scalable database access

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Embla Carousel**: Touch-friendly carousel for photo galleries
- **React Hook Form**: Form state management with validation
- **Class Variance Authority**: Utility for creating component variants

### Development Tools
- **Drizzle Kit**: Database schema management and migration tools
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **ESBuild**: Fast bundling for server-side code
- **Replit Integration**: Development environment optimization with error overlay

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class composition
- **nanoid**: Unique ID generation for entities
- **Zod**: Runtime type validation and schema definition

### Production Considerations
- **Environment Variables**: DATABASE_URL for database connection configuration
- **Static Assets**: Vite build output served by Express in production
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions
- **Error Monitoring**: Comprehensive error logging and user feedback systems