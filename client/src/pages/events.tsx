import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, Heart, Handshake, Palette, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const CATEGORY_ICONS = {
  workshop: Palette,
  volunteering: Heart,
  social: Users,
  sports: Dumbbell,
  cultural: CalendarDays,
};

const CATEGORY_COLORS = {
  workshop: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  volunteering: "bg-green-500/10 text-green-700 border-green-500/20",
  social: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  sports: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  cultural: "bg-pink-500/10 text-pink-700 border-pink-500/20",
};

export default function Events() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());

  // Mock user ID - in real app this would come from auth context
  const userId = "701bd80c-33eb-4431-83ab-3006804af554";

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => apiRequest("GET", "/api/events").then(res => res.json()),
  });

  const { data: sharedMatchesData } = useQuery({
    queryKey: ["/api/users", userId, "shared-event-matches"],
    queryFn: () => apiRequest("GET", `/api/users/${userId}/shared-event-matches`).then(res => res.json()),
  });

  const joinEventMutation = useMutation({
    mutationFn: (eventId: string) => 
      apiRequest("POST", `/api/events/${eventId}/join`, { userId }),
    onSuccess: (_, eventId) => {
      setJoinedEvents(prev => new Set([...prev, eventId]));
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "shared-event-matches"] });
      toast({
        title: "Successfully joined event!",
        description: "You'll be notified if anyone else from the app joins the same event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join event",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const events: Event[] = eventsData?.events || [];
  const sharedMatches = sharedMatchesData?.matches || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Shared Experience Matchmaker</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join events, workshops, and volunteer opportunities to meet like-minded people. 
          When you and another user sign up for the same activity, you'll be matched automatically.
        </p>
      </div>

      {/* Shared Event Matches */}
      {sharedMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">People You'll Meet at Events</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedMatches.map((user: any) => (
              <Card key={user.id} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.profilePhoto} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.age}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    You're both signed up for upcoming events together!
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No events available</h3>
              <p className="text-muted-foreground">Check back later for new events and activities.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => {
              const IconComponent = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] || CalendarDays;
              const isJoined = joinedEvents.has(event.id);
              const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4" />
                          <Badge 
                            variant="outline" 
                            className={CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] || ""}
                          >
                            {event.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {event.description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.currentParticipants}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} joined
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => joinEventMutation.mutate(event.id)}
                      disabled={isJoined || isFull || joinEventMutation.isPending}
                      className="w-full"
                      variant={isJoined ? "outline" : "default"}
                    >
                      {joinEventMutation.isPending ? (
                        "Joining..."
                      ) : isJoined ? (
                        "✓ Joined"
                      ) : isFull ? (
                        "Event Full"
                      ) : (
                        "Join Event"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">How Shared Experience Matching Works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Join events that interest you from our curated list</p>
            <p>• When another app user joins the same event, you'll be automatically matched</p>
            <p>• Start chatting and plan to meet at the event</p>
            <p>• Your shared activity gives you an instant conversation starter</p>
            <p>• After meeting, share your experience through our reflection feature</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}