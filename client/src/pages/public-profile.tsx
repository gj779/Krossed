import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, MapPin, Briefcase, Heart, Camera, ArrowLeft, MessageCircle, Users } from "lucide-react";
import { KrossedLogo } from "@/components/krossed-logo";
import { VerifiedBadge } from "@/components/verified-badge";
import { SocialShare } from "@/components/social-share";
import { Link } from "wouter";

export default function PublicProfilePage() {
  const [match, params] = useRoute("/profile/:userId");
  const userId = params?.userId;

  // Get public profile data
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['/api/public-profile', userId],
    enabled: !!userId,
    retry: false,
  });

  if (!match || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Available</h1>
          <p className="text-gray-600 mb-4">This profile is private or doesn't exist.</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = profileData.user;
  const isOwnProfile = profileData.isOwnProfile;

  const getLastActiveText = () => {
    const diffMs = Date.now() - new Date(user.lastActive).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 5) return "Active now";
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Active ${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-primary text-white p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <KrossedLogo size={24} className="text-white" />
              <h1 className="font-poppins font-bold text-xl">
                {isOwnProfile ? "Your Profile" : `${user.name}'s Profile`}
              </h1>
            </div>
            {!isOwnProfile && (
              <SocialShare user={user} className="text-white" />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-200">
                  <img
                    src={user.profilePhoto || "https://via.placeholder.com/200"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    data-testid="img-profile-photo"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h2 className="text-xl font-bold" data-testid="text-user-name">
                  {user.name}, {user.age}
                </h2>
                {user.isPremium && (
                  <Badge className="gradient-accent text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    PREMIUM
                  </Badge>
                )}
                {user.isPhotoVerified && (
                  <VerifiedBadge 
                    isVerified={user.isPhotoVerified} 
                    verificationDate={new Date('2025-01-15')}
                    size="md"
                  />
                )}
              </div>
              
              <p className="text-sm text-gray-600" data-testid="text-last-active">
                {getLastActiveText()}
              </p>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-4 text-center">
                <p className="text-gray-700" data-testid="text-bio">{user.bio}</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-3 text-sm">
              {user.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span data-testid="text-location">{user.location}</span>
                </div>
              )}
              
              {user.occupation && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span data-testid="text-occupation">{user.occupation}</span>
                </div>
              )}
            </div>

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <Badge 
                      key={interest} 
                      variant="secondary" 
                      className="text-xs"
                      data-testid={`badge-interest-${interest.toLowerCase()}`}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions for non-own profiles */}
        {!isOwnProfile && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-gray-800">Interested in connecting?</h3>
                <p className="text-sm text-gray-600">
                  Download Krossed to start meaningful conversations and plan real meetups nearby.
                </p>
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1 gradient-primary text-white"
                    data-testid="button-download-app"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Download App
                  </Button>
                  <SocialShare 
                    user={user} 
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* App Info */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <KrossedLogo size={20} />
                <h3 className="font-semibold text-gray-800">Krossed Dating</h3>
              </div>
              <p className="text-sm text-gray-600">
                "Crossing paths does not mean it has to end"
              </p>
              <p className="text-xs text-gray-500">
                Proximity-based dating focused on real-world connections
              </p>
              {!isOwnProfile && (
                <Button 
                  size="sm" 
                  className="mt-2 gradient-primary text-white"
                  data-testid="button-join-app"
                >
                  Join Krossed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="text-center text-xs text-gray-500 px-4">
          This is a public profile. Only basic information is shown to protect user privacy.
        </div>
      </div>
    </div>
  );
}