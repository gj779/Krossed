import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Message, Match, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ArrowLeft, Mic } from "lucide-react";
import { KrossedLogo } from "@/components/krossed-logo";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { VoiceMessageRecorder } from "@/components/voice-message-recorder";
import { VoiceMessagePlayer } from "@/components/voice-message-player";

interface MatchWithUsers extends Match {
  user1: User;
  user2: User;
}

export default function MessagesPage() {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showMeetupSuggestion, setShowMeetupSuggestion] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  
  const currentUser = getCurrentUser()!;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Handle URL parameter for pre-selecting a match
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchParam = urlParams.get('match');
    if (matchParam) {
      setSelectedMatchId(matchParam);
    }
  }, [location]);

  // Fetch user's matches
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/matches', currentUser.id],
    enabled: !!currentUser,
  });

  const matches = (matchesData as any)?.matches || [];

  // Fetch messages for selected match
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', selectedMatchId],
    enabled: !!selectedMatchId,
  });

  const messages: Message[] = (messagesData as any)?.messages || [];

  // Fetch match details with both users
  const { data: matchData } = useQuery({
    queryKey: ['/api/match', selectedMatchId],
    enabled: !!selectedMatchId,
  });

  const currentMatch: MatchWithUsers | undefined = (matchData as any)?.match;

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/messages?userId=${currentUser.id}`, {
        matchId: selectedMatchId,
        content,
        messageType: 'text',
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedMatchId] });
      toast({ title: "Message sent!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send voice message mutation
  const sendVoiceMessageMutation = useMutation({
    mutationFn: async ({ audioBlob, duration }: { audioBlob: Blob; duration: number }) => {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const response = await apiRequest('POST', `/api/messages/voice-upload?userId=${currentUser.id}`, {
        audioData: base64Audio,
        matchId: selectedMatchId,
        duration,
      });
      return response.json();
    },
    onSuccess: () => {
      setShowVoiceRecorder(false);
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedMatchId] });
      toast({ title: "Voice message sent!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send voice message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatchId) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const getOtherUser = (match: MatchWithUsers): User => {
    return match.user1.id === currentUser.id ? match.user2 : match.user1;
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return messageDate.toLocaleDateString();
  };

  if (matchesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  // Chat view
  if (selectedMatchId && currentMatch) {
    const otherUser = getOtherUser(currentMatch);
    
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Chat header */}
        <header className="gradient-primary text-white p-4 sticky top-0 z-40">
          <div className="max-w-md mx-auto flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMatchId(null)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
              <img
                src={otherUser.profilePhoto || "https://via.placeholder.com/100"}
                alt={otherUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h2 className="font-semibold">{otherUser.name}</h2>
              <p className="text-xs opacity-80">Active recently</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="font-semibold mb-2">Say hello!</h3>
              <p className="text-sm text-gray-600">Start a conversation with {otherUser.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  {message.messageType === 'voice' && message.voiceUrl ? (
                    <VoiceMessagePlayer
                      voiceUrl={message.voiceUrl}
                      duration={message.voiceDuration || 0}
                      isFromCurrentUser={message.senderId === currentUser.id}
                      timestamp={new Date(message.createdAt || Date.now())}
                    />
                  ) : (
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 ${
                        message.senderId === currentUser.id
                          ? 'gradient-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.createdAt || new Date())}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message limits and premium messaging features */}
        <div className="p-4 border-t max-w-md mx-auto w-full">
          {/* Premium messaging banner */}
          {!currentUser.isPremium && messages.length >= 3 && (
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">💎</span>
                <h4 className="font-semibold text-purple-800">Upgrade for Unlimited Messages</h4>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Premium members can send unlimited messages and get priority responses.
              </p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  onClick={() => window.location.href = '/subscribe'}
                >
                  Go Premium
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                  onClick={() => setShowMeetupSuggestion(true)}
                >
                  Suggest Meetup Instead
                </Button>
              </div>
            </div>
          )}

          {/* Meetup encouragement for all users */}
          {messages.length >= 3 && (
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">☕</span>
                <h4 className="font-semibold text-orange-800">Time to meet in person!</h4>
              </div>
              <p className="text-sm text-orange-700 mb-3">
                You've exchanged a few messages. Why not meet up for coffee nearby?
              </p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                  onClick={() => setShowMeetupSuggestion(true)}
                >
                  Suggest Meetup
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 text-xs"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}

          {/* Meetup suggestion options */}
          {showMeetupSuggestion && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Suggest a meetup</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMeetupSuggestion(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    sendMessageMutation.mutate(`Hi ${otherUser.name}! I'm free for coffee right now if you're nearby. Want to meet up? ☕`);
                    setShowMeetupSuggestion(false);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium text-sm py-3"
                >
                  ⚡ Suggest Meeting Now
                </Button>
                
                <Button
                  onClick={() => {
                    sendMessageMutation.mutate(`Hey ${otherUser.name}! Want to plan a coffee date for later this week? I'd love to meet up! 📅`);
                    setShowMeetupSuggestion(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm py-3"
                >
                  📅 Plan Future Date
                </Button>
              </div>
            </div>
          )}

          {/* Voice message recorder */}
          {showVoiceRecorder && (
            <div className="mb-4">
              <VoiceMessageRecorder
                onSend={(audioBlob, duration) => {
                  sendVoiceMessageMutation.mutate({ audioBlob, duration });
                }}
                onCancel={() => setShowVoiceRecorder(false)}
                maxDuration={120}
              />
            </div>
          )}

          {/* Message input with premium features and voice */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Button
              type="button"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              variant="outline"
              size="sm"
              className="p-2"
              disabled={!currentUser.isPremium && messages.length >= 10}
              data-testid="button-voice-message"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                currentUser.isPremium 
                  ? "Send unlimited messages..."
                  : messages.length >= 10 
                    ? "Consider meeting in person..." 
                    : "Type a message..."
              }
              className="flex-1"
              disabled={sendMessageMutation.isPending || (!currentUser.isPremium && messages.length >= 10)}
              maxLength={currentUser.isPremium ? 500 : (messages.length >= 5 ? 100 : 200)}
              data-testid="input-message"
            />
            <Button
              type="submit"
              disabled={
                !newMessage.trim() || 
                sendMessageMutation.isPending || 
                (!currentUser.isPremium && messages.length >= 10)
              }
              size="sm"
              className={`px-4 ${currentUser.isPremium ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {/* Message limit indicators */}
          {!currentUser.isPremium && (
            <div className="mt-2 text-center">
              {messages.length >= 10 ? (
                <p className="text-xs text-red-500">
                  Message limit reached. Upgrade to Premium for unlimited messaging or suggest a meetup!
                </p>
              ) : messages.length >= 5 ? (
                <p className="text-xs text-amber-600">
                  {10 - messages.length} messages remaining • {100 - newMessage.length} chars left
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {10 - messages.length} messages remaining • {200 - newMessage.length} chars left
                </p>
              )}
            </div>
          )}
          
          {currentUser.isPremium && (
            <p className="text-xs text-purple-600 mt-2 text-center">
              Premium: Unlimited messages • {500 - newMessage.length} chars remaining
            </p>
          )}
        </div>
      </div>
    );
  }

  // Matches list view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <KrossedLogo size={32} className="text-white" />
            <h1 className="font-poppins font-bold text-lg">Messages</h1>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/20">
            {matches.length} matches
          </Badge>
        </div>
      </header>

      {/* Enhanced messaging features announcement */}
      <div className="p-4">
        {currentUser.isPremium ? (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">💎</span>
              <h3 className="font-semibold text-purple-800">Premium Messaging Active</h3>
            </div>
            <p className="text-sm text-purple-700">
              Unlimited messages, longer character limits, and priority messaging are now active.
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">💬</span>
              <h3 className="font-semibold text-blue-800">Continue Your Conversations</h3>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Focus on planning meetups with your existing matches below.
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-amber-600">⚠️ Free users: 10 messages per conversation</span>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                onClick={() => window.location.href = '/subscribe'}
              >
                Upgrade for Unlimited
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Matches List */}
      <div className="px-4 pb-20">
        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="font-poppins font-bold text-xl mb-2">No conversations yet</h3>
            <p className="text-gray-600 text-sm">
              Start swiping to find your first match!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match: any) => {
              const otherUser = match.otherUser;
              
              return (
                <Card
                  key={match.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMatchId(match.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={otherUser.profilePhoto || "https://via.placeholder.com/100"}
                          alt={otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{otherUser.name}</h3>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(match.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-gray-600 truncate">
                            {match.messageCount > 0 
                              ? `${match.messageCount}/10 messages • Plan meetup`
                              : "You matched! Start the conversation"
                            }
                          </p>
                          {!currentUser.isPremium && match.messageCount >= 8 && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-600">
                              Limit soon
                            </Badge>
                          )}
                          {!currentUser.isPremium && match.messageCount >= 10 && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-600">
                              Limit reached
                            </Badge>
                          )}
                          {currentUser.isPremium && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-600">
                              Unlimited
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
