import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SwipeCard } from "@/components/swipe-card";
import { MatchModal } from "@/components/match-modal";
import { PremiumModal } from "@/components/premium-modal";
import { LocationModal } from "@/components/location-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { User, Match } from "@shared/schema";
import { Heart, X, Star, Zap, MapPin, Eye, Crown, Brain, Shuffle } from "lucide-react";
import { KrossedLogo } from "@/components/krossed-logo";
import { useToast } from "@/hooks/use-toast";

interface DiscoverUser extends User {
  distance: number;
}

export default function HomePage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [smartMatching, setSmartMatching] = useState(false);
  
  const currentUser = getCurrentUser()!;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch discoverable users with timeline alignment for premium users
  const { data: discoverData, isLoading, refetch } = useQuery({
    queryKey: ['/api/discover', currentUser.id, smartMatching],
    queryFn: () => {
      const params = new URLSearchParams();
      if (smartMatching) params.append('useCompatibilityMatching', 'true');
      if (currentUser.isPremium && currentUser.meetReadiness) {
        params.append('meetReadiness', currentUser.meetReadiness);
      }
      return fetch(`/api/discover/${currentUser.id}?${params}`).then(res => res.json());
    },
    enabled: !!currentUser,
  });

  const users: DiscoverUser[] = discoverData?.users || [];
  const currentDisplayUser = users[currentCardIndex];

  // Check if location permission was granted
  useEffect(() => {
    const locationGranted = localStorage.getItem('locationGranted');
    if (!locationGranted) {
      setShowLocationModal(true);
    }
  }, []);

  // Swipe mutation with meetup preference
  const swipeMutation = useMutation({
    mutationFn: async ({ swipedId, isLike, isSuperLike = false, meetupPreference }: { 
      swipedId: string; 
      isLike: boolean; 
      isSuperLike?: boolean;
      meetupPreference?: string;
    }) => {
      const response = await apiRequest('POST', `/api/swipe?userId=${currentUser.id}`, {
        swipedId,
        isLike,
        isSuperLike,
        meetupPreference,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        setMatchedUser(currentDisplayUser);
        setShowMatchModal(true);
      }
      
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
      
      // Invalidate discover query to get fresh data when running low
      if (currentCardIndex >= users.length - 3) {
        queryClient.invalidateQueries({ queryKey: ['/api/discover', currentUser.id] });
      }
    },
    onError: (error: any) => {
      if (error.message.includes('Daily view limit reached')) {
        setDailyLimitReached(true);
        toast({
          title: "Daily limit reached!",
          description: "Come back tomorrow or upgrade to Premium for unlimited swipes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    },
  });

  const handleSwipe = (direction: 'left' | 'right' | 'super') => {
    if (!currentDisplayUser) return;
    
    const isLike = direction !== 'left';
    const isSuperLike = direction === 'super';
    
    swipeMutation.mutate({ 
      swipedId: currentDisplayUser.id, 
      isLike,
      isSuperLike
    });

    // Show appropriate toast message
    if (direction === 'super') {
      toast({
        title: "Super like sent! ⭐",
        description: "You really want to connect with this person.",
      });
    } else if (direction === 'right') {
      toast({
        title: "Like sent! 👍",
        description: "If they like you back, it's a match!",
      });
    }
  };

  const handleBoost = () => {
    if (!currentUser.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    toast({ title: "Boost activated!", description: "You're now being shown to more people." });
  };

  const handleEnableLocation = () => {
    // In a real app, request geolocation permission here
    localStorage.setItem('locationGranted', 'true');
    setShowLocationModal(false);
    toast({ title: "Location enabled!", description: "Now showing you people nearby." });
  };

  const handleManualLocation = () => {
    localStorage.setItem('locationGranted', 'manual');
    setShowLocationModal(false);
    toast({ title: "Location set manually", description: "You can update this in your profile." });
  };

  const handleSendMessage = () => {
    setShowMatchModal(false);
    // In a real app, navigate to messages
    toast({ title: "Message sent!", description: "Start chatting with your match." });
  };

  const handleKeepSwiping = () => {
    setShowMatchModal(false);
  };

  const handleUpgradePremium = () => {
    setShowPremiumModal(false);
    window.location.href = '/subscribe';
  };

  const getRemainingViews = () => {
    const limit = currentUser.isPremium ? Infinity : 15;
    const used = currentUser.dailyViewsUsed || 0;
    return Math.max(0, limit - used);
  };

  const getResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding people nearby...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white p-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KrossedLogo size={28} className="text-white" />
            <h1 className="font-poppins font-bold text-base">Krossed</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Smart matching toggle - compact */}
            <button
              onClick={() => {
                setSmartMatching(!smartMatching);
                setCurrentCardIndex(0);
                refetch();
                toast({
                  title: smartMatching ? "Standard discovery enabled" : "Smart matching enabled",
                  description: smartMatching 
                    ? "Showing all nearby profiles"
                    : "Showing compatible matches based on your preferences"
                });
              }}
              className={`px-2 py-1 rounded-md text-white font-medium text-xs border transition-all ${
                smartMatching 
                  ? 'bg-purple-600/90 border-purple-400/50' 
                  : 'bg-orange-500/90 border-orange-300/50'
              }`}
              title={smartMatching ? "Switch to standard discovery" : "Switch to smart matching"}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm">{smartMatching ? "🧠" : "🔀"}</span>
                <span className="font-medium text-xs">{smartMatching ? "SMART" : "ALL"}</span>
              </div>
            </button>
            
            {/* Daily views counter */}
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/20 text-xs px-2 py-1">
              <Eye className="w-3 h-3 mr-1" />
              {getRemainingViews()}/{currentUser.isPremium ? '20' : '5'}
            </Badge>
            
            {/* Profile photo */}
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/30">
              <img
                src={currentUser.profilePhoto || "https://via.placeholder.com/100"}
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Daily limit banner */}
      {dailyLimitReached && !currentUser.isPremium && (
        <div className="bg-amber-50 border-l-4 border-accent p-3 mx-3 my-2 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 text-sm">Daily paths explored!</h3>
              <p className="text-amber-700 text-xs mt-1">Continue with existing matches or come back tomorrow.</p>
              <p className="text-xs text-amber-600 mt-1">New crossings in <span className="font-bold">{getResetTime()}</span></p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                onClick={() => window.location.href = '/messages'}
                variant="outline"
                size="sm"
                className="border-amber-600 text-amber-800 hover:bg-amber-100 text-xs px-3 py-1"
              >
                Messages
              </Button>
              <Button 
                onClick={() => setShowPremiumModal(true)}
                className="gradient-accent text-black hover:opacity-90 text-xs px-3 py-1"
                size="sm"
              >
                Go Premium
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="px-3 py-4 flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          {currentDisplayUser ? (
            <SwipeCard
              user={currentDisplayUser}
              currentUser={currentUser}
              onSwipeLeft={() => handleSwipe('left')}
              onSwipeRight={() => handleSwipe('right')}
              onSuperLike={() => handleSwipe('super')}
            />
          ) : (
            <div className="bg-white rounded-2xl card-shadow p-6 text-center h-[520px] flex flex-col items-center justify-center">
              <div className="text-5xl mb-4">😊</div>
              <h3 className="font-poppins font-bold text-lg mb-2">All caught up!</h3>
              <p className="text-gray-600 text-sm mb-6 px-4">
                {dailyLimitReached 
                  ? "Your paths will cross again tomorrow with new profiles"
                  : "New paths to cross will appear soon"
                }
              </p>
              {!currentUser.isPremium && (
                <Button 
                  onClick={() => setShowPremiumModal(true)}
                  className="gradient-accent text-black hover:opacity-90"
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Modals */}
      {matchedUser && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          currentUser={currentUser}
          matchedUser={matchedUser}
          onSendMessage={handleSendMessage}
          onKeepSwiping={handleKeepSwiping}
        />
      )}

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgradePremium}
      />

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onEnableLocation={handleEnableLocation}
        onManualLocation={handleManualLocation}
      />
    </div>
  );
}
