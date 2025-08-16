import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Match, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Clock, MapPin, Pause, Play, Plus, Calendar, Shield, Video } from "lucide-react";
import { KrossedLogo } from "@/components/krossed-logo";

import { VideoChat } from "@/components/video-chat";
import { Link } from "wouter";

interface MatchWithUser extends Match {
  otherUser: User;
}

export default function MatchesPage() {
  const currentUser = getCurrentUser()!;
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const [showVideoChat, setShowVideoChat] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithUser | null>(null);

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['/api/matches', currentUser.id],
    enabled: !!currentUser,
  });

  const matches: MatchWithUser[] = (matchesData as any)?.matches || [];
  
  // Check if user has any confirmed dates
  const hasConfirmedDates = matches.some(match => match.meetupConfirmed);

  const extendMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await apiRequest('POST', `/api/matches/${matchId}/extend`, {
        userId: currentUser.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches', currentUser.id] });
      toast({
        title: "Match Extended! ⏰",
        description: "Added 24 hours to your match countdown.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Extension Failed",
        description: error.message || "Could not extend match",
        variant: "destructive",
      });
    },
  });

  const freezeMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await apiRequest('POST', `/api/matches/${matchId}/freeze`, {
        userId: currentUser.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches', currentUser.id] });
      toast({
        title: "Match Frozen! ❄️",
        description: "Timer paused while you're traveling.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Freeze Failed",
        description: error.message || "Could not freeze match",
        variant: "destructive",
      });
    },
  });

  const unfreezeMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await apiRequest('POST', `/api/matches/${matchId}/unfreeze`, {
        userId: currentUser.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches', currentUser.id] });
      toast({
        title: "Match Unfrozen! 🔄",
        description: "Timer resumed counting down.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unfreeze Failed",
        description: error.message || "Could not unfreeze match",
        variant: "destructive",
      });
    },
  });

  const getTimeRemaining = (expiresAt: Date, isFrozen: boolean) => {
    if (isFrozen) return "Frozen";
    
    const now = new Date();
    const diffMs = new Date(expiresAt).getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h`;
    }
    
    return `${diffHours}h ${diffMins}m`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
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
            <KrossedLogo size={24} className="text-white" />
            <h1 className="font-poppins font-bold text-base">Your Matches</h1>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/20 text-xs px-2 py-1">
              {matches.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            {hasConfirmedDates && (
              <Link href="/date-safety">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 px-2 py-1 text-xs"
                  data-testid="button-date-safety"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Date Safety
                </Button>
              </Link>
            )}
            <Link href="/safety">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 p-2"
                data-testid="button-safety"
              >
                <Shield className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-3 pb-20">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💕</div>
            <h3 className="font-poppins font-bold text-lg mb-2">No paths crossed yet</h3>
            <p className="text-gray-600 text-sm mb-6 px-4">
              Keep swiping to find where your paths will cross!
            </p>
            <Button className="gradient-primary text-white" size="sm">
              Back to Discovery
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const timeRemaining = getTimeRemaining(match.expiresAt || new Date(), match.isFrozen || false);
              const isExpired = timeRemaining === "Expired";
              const canExtend = currentUser.isPremium && !match.isExtended && !isExpired;
              const canFreeze = currentUser.isPremium && !isExpired;
              
              return (
                <Card key={match.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${isExpired ? 'opacity-60' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* User photo */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <img
                          src={match.otherUser.profilePhoto || "https://via.placeholder.com/100"}
                          alt={match.otherUser.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                      </div>
                      
                      {/* Match info */}
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {match.otherUser.name}, {match.otherUser.age}
                            </h3>
                            {match.otherUser.occupation && (
                              <p className="text-xs text-gray-600 flex items-center mt-1 truncate">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                {match.otherUser.occupation}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <Badge 
                              variant={isExpired ? "destructive" : match.isFrozen ? "secondary" : "default"}
                              className="text-xs mb-1 px-2 py-1"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {timeRemaining}
                            </Badge>
                            {match.isExtended && (
                              <Badge variant="outline" className="text-xs block px-2 py-1">
                                Extended
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {!isExpired && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                Matched {getTimeAgo(match.createdAt || new Date())}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs px-2 py-1 h-7"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setShowVideoChat(true);
                                }}
                              >
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </Button>
                              <Link href={`/messages?match=${match.id}`}>
                                <Button size="sm" className="gradient-primary text-white text-xs px-2 py-1 h-7">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Message
                                </Button>
                              </Link>
                              
                              {/* Premium Match Management - Inline */}
                              {currentUser.isPremium && (
                                <>
                                  {canExtend && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => extendMatchMutation.mutate(match.id)}
                                      disabled={extendMatchMutation.isPending}
                                      className="text-xs px-2 py-1 h-7"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      +24h
                                    </Button>
                                  )}
                                  {canFreeze && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => 
                                        match.isFrozen 
                                          ? unfreezeMatchMutation.mutate(match.id)
                                          : freezeMatchMutation.mutate(match.id)
                                      }
                                      disabled={freezeMatchMutation.isPending || unfreezeMatchMutation.isPending}
                                      className="text-xs px-2 py-1 h-7"
                                    >
                                      {match.isFrozen ? (
                                        <>
                                          <Play className="h-3 w-3 mr-1" />
                                          Resume
                                        </>
                                      ) : (
                                        <>
                                          <Pause className="h-3 w-3 mr-1" />
                                          Freeze
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              {!currentUser.isPremium && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.location.href = '/subscribe'}
                                  className="text-xs text-purple-600 border-purple-200 hover:bg-purple-50 px-2 py-1 h-7"
                                >
                                  ⭐ Premium
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {isExpired && (
                          <div className="text-center py-2">
                            <p className="text-sm text-gray-500 mb-2">This match has expired</p>
                            <Badge variant="secondary" className="text-xs">
                              Meetup window closed
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick bio preview */}
                    {match.otherUser.bio && !isExpired && (
                      <div className="px-3 pb-3">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {match.otherUser.bio}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Chat Modal */}
      {showVideoChat && selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <VideoChat
              matchId={selectedMatch.id}
              otherUserId={selectedMatch.otherUser.id}
              otherUserName={selectedMatch.otherUser.name || selectedMatch.otherUser.username}
              currentUserId={currentUser.id}
              onCallEnd={() => {
                setShowVideoChat(false);
                setSelectedMatch(null);
              }}
            />
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowVideoChat(false);
                  setSelectedMatch(null);
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
