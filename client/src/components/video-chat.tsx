import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneCall, 
  PhoneOff,
  Star,
  Shield,
  Clock,
  Users
} from "lucide-react";
// Simplified video chat without WebRTC for now
// This will be a basic placeholder until WebRTC is properly configured

interface VideoChatProps {
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  currentUserId: string;
  onCallEnd?: () => void;
}

export function VideoChat({ matchId, otherUserId, otherUserName, currentUserId, onCallEnd }: VideoChatProps) {
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callQuality, setCallQuality] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get video chat sessions for this match
  const { data: chatSessions } = useQuery({
    queryKey: ['/api/video-chat/sessions', matchId],
    retry: false,
  });

  const startCallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/video-chat/initiate', {
        matchId,
        participantId: otherUserId
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setCallStatus('calling');
      
      toast({
        title: "Video Chat Initiated",
        description: `Starting video chat with ${otherUserName}`,
      });

      // Simulate call connection after 2 seconds
      setTimeout(() => {
        setCallStatus('connected');
        toast({
          title: "Connected!",
          description: `You're now video chatting with ${otherUserName}`,
        });
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Call Failed",
        description: error.message || "Unable to start video call",
        variant: "destructive",
      });
    },
  });

  const endCall = async () => {
    if (callDuration > 0) {
      try {
        await apiRequest('POST', '/api/video-chat/end', {
          matchId,
          duration: callDuration,
          callQuality: callQuality || 3
        });
      } catch (error) {
        console.error('Error saving call data:', error);
      }
    }

    setCallStatus('ended');
    onCallEnd?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate call timing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // If call is active
  if (callStatus === 'connected' || callStatus === 'calling') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
        {/* Video call simulation */}
        <div className="relative bg-gray-900 rounded-lg aspect-video mb-4 flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{otherUserName}</p>
            {callStatus === 'calling' && (
              <p className="text-sm opacity-75">Connecting...</p>
            )}
            {callStatus === 'connected' && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm">Connected • {formatDuration(callDuration)}</p>
              </div>
            )}
          </div>
          
          {/* Simulated local video */}
          <div className="absolute bottom-4 right-4 w-20 h-16 bg-gray-800 rounded border-2 border-white/20 flex items-center justify-center">
            <Video className="h-6 w-6 text-white/50" />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={endCall}
            variant="destructive"
            className="rounded-full"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>

        {/* Call status info */}
        <div className="mt-4 text-center">
          <Badge className="bg-green-600">
            <Shield className="h-3 w-3 mr-1" />
            Verified Video Chat
          </Badge>
        </div>
      </div>
    );
  }

  // Post-call rating
  if (callStatus === 'ended' && callDuration > 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Rate Your Video Chat</CardTitle>
          <p className="text-sm text-gray-600">How was your conversation with {otherUserName}?</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                onClick={() => setCallQuality(rating)}
                variant={callQuality >= rating ? "default" : "outline"}
                size="sm"
                className="p-1"
              >
                <Star className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => {
              setCallStatus('idle');
              setCallDuration(0);
              onCallEnd?.();
            }}
            className="w-full"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default state - call initiation
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Chat
        </CardTitle>
        <p className="text-sm text-gray-600">
          Have a quick video chat with {otherUserName} before meeting in person
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Shield className="h-4 w-4" />
          Verified face-to-face conversation builds trust
        </div>
        
        {chatSessions && chatSessions.length > 0 && (
          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Previous calls: {chatSessions.length}
            </div>
          </div>
        )}

        <Button 
          onClick={() => startCallMutation.mutate()}
          disabled={startCallMutation.isPending || callStatus !== 'idle'}
          className="w-full"
        >
          <Video className="h-4 w-4 mr-2" />
          {startCallMutation.isPending ? 'Starting Call...' : 'Start Video Chat'}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Simulated video chat for demonstration
        </p>
      </CardContent>
    </Card>
  );
}