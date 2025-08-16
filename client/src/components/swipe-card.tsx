import { User } from "@shared/schema";
import { useSwipe } from "@/hooks/use-swipe";
import { Crown, MapPin, Briefcase, Clock, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedIcon } from "@/components/verified-badge";

interface SwipeCardProps {
  user: User & { 
    distance?: number;
    compatibilityScore?: number;
    compatibilityReasons?: string[];
    timelineAlignment?: number;
    timelineReason?: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  currentUser?: User;
}

export function SwipeCard({ user, onSwipeLeft, onSwipeRight, onSuperLike, currentUser }: SwipeCardProps) {
  const { swipeProps, position, isDragging } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp: onSuperLike,
  });

  const rotation = position.x * 0.1;
  const opacity = isDragging ? 0.9 : 1;

  const getLastActiveText = (lastActive: Date) => {
    const diffMs = Date.now() - new Date(lastActive).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `Active ${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `Active ${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Active ${diffDays}d ago`;
    }
  };

  return (
    <div className="relative">
      {/* Background cards for stack effect */}
      <div className="absolute inset-4 bg-gray-100 rounded-2xl transform rotate-2 opacity-30 z-0" />
      <div className="absolute inset-4 bg-gray-200 rounded-2xl transform rotate-1 opacity-50 z-0" />
      
      {/* Main card */}
      <div
        {...swipeProps}
        className={`relative bg-white rounded-2xl card-shadow overflow-hidden h-[520px] cursor-grab active:cursor-grabbing z-10 swipe-card ${
          isDragging ? "scale-105" : ""
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
          opacity,
        }}
      >
        {/* Image Container */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={user.profilePhoto || user.photos?.[0] || "https://via.placeholder.com/400x600"}
            alt={user.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Photo indicators */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i === 0 ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* Distance badge */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            <MapPin className="w-3 h-3 inline mr-1 text-accent" />
            {user.distance ? `${user.distance} km away` : "Nearby"}
          </div>

          {/* Verified badge */}
          {user.isPhotoVerified && (
            <div className="absolute top-16 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
              <VerifiedIcon 
                isVerified={user.isPhotoVerified} 
                verificationDate={new Date('2025-01-15')}
                size="sm"
                className=""
              />
            </div>
          )}

          {/* Compatibility badge for smart matching */}
          {user.compatibilityScore && (
            <div className="absolute top-16 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              <Heart className="w-3 h-3 inline mr-1" />
              {user.compatibilityScore}% Match
            </div>
          )}

          {/* Premium badge */}
          {user.isPremium && (
            <div className={`absolute ${user.compatibilityScore ? 'top-24' : 'top-16'} right-4 gradient-accent text-black px-2 py-1 rounded-full text-xs font-bold`}>
              <Crown className="w-3 h-3 inline mr-1" />
              PREMIUM
            </div>
          )}

          {/* Basic info overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="font-poppins font-bold text-2xl">
              {user.name}, {user.age}
            </h2>
            <div className="flex items-center mt-1 space-x-3 text-sm opacity-90">
              {user.occupation && (
                <span className="flex items-center">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {user.occupation}
                </span>
              )}
              {user.location && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Timeline Alignment for Premium Users */}
          {currentUser?.isPremium && user.timelineAlignment && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timeline Alignment
                </span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    user.timelineAlignment >= 80 ? 'bg-green-500' :
                    user.timelineAlignment >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-xs font-bold text-purple-700">
                    {user.timelineAlignment}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-600 leading-tight">
                {user.timelineReason}
              </p>
            </div>
          )}

          {/* About section */}
          {user.bio && (
            <div>
              <h3 className="font-medium text-gray-800 mb-1 text-sm">About {user.name.split(' ')[0]}</h3>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{user.bio}</p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-1 text-sm">Interests</h3>
              <div className="flex flex-wrap gap-1">
                {user.interests.slice(0, 4).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2 py-1">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 4 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                    +{user.interests.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Last active */}
          <div className="text-xs text-gray-500 flex items-center mt-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
            <Clock className="w-3 h-3 mr-1" />
            {getLastActiveText(user.lastActive)}
          </div>
        </div>

        {/* Swipe indicators */}
        {isDragging && (
          <>
            {position.x > 50 && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <div className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl transform rotate-12">
                  LIKE
                </div>
              </div>
            )}
            {position.x < -50 && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-xl transform -rotate-12">
                  PASS
                </div>
              </div>
            )}
            {position.y < -50 && (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                <div className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl">
                  SUPER LIKE
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
