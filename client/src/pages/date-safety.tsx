import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { KrossedLogo } from "@/components/krossed-logo";
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Users,
  Heart,
  Calendar
} from "lucide-react";

export default function DateSafetyPage() {
  const currentUser = getCurrentUser()!;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<"safe" | "need_help" | "emergency">("safe");
  const [checkInMessage, setCheckInMessage] = useState("");

  // Get upcoming dates
  const { data: upcomingDates } = useQuery({
    queryKey: ['/api/dates/upcoming'],
    retry: false,
  });

  // Get trusted contacts
  const { data: trustedContacts } = useQuery({
    queryKey: ['/api/safety/trusted-contacts'],
    retry: false,
  });

  // Emergency alert mutation
  const emergencyAlertMutation = useMutation({
    mutationFn: async (data: { message: string; location?: string }) => {
      const response = await apiRequest('POST', '/api/safety/emergency-alert', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Emergency Alert Sent", 
        description: "Your trusted contacts have been notified with your location.",
        variant: "destructive" 
      });
      setIsEmergencyDialogOpen(false);
      setEmergencyMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Date check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (data: { dateId: string; status: string; message?: string; location?: string }) => {
      const response = await apiRequest('POST', '/api/safety/date-checkin', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Check-in Recorded", 
        description: "Your safety status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/safety/date-checkins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEmergencyAlert = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude},${position.coords.longitude}`;
          emergencyAlertMutation.mutate({ message: emergencyMessage, location });
        },
        () => {
          emergencyAlertMutation.mutate({ message: emergencyMessage });
        }
      );
    } else {
      emergencyAlertMutation.mutate({ message: emergencyMessage });
    }
  };

  const handleDateCheckIn = (dateId: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude},${position.coords.longitude}`;
          checkInMutation.mutate({ 
            dateId, 
            status: checkInStatus, 
            message: checkInMessage, 
            location 
          });
        },
        () => {
          checkInMutation.mutate({ 
            dateId, 
            status: checkInStatus, 
            message: checkInMessage 
          });
        }
      );
    } else {
      checkInMutation.mutate({ 
        dateId, 
        status: checkInStatus, 
        message: checkInMessage 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe": return "bg-green-100 text-green-800";
      case "need_help": return "bg-yellow-100 text-yellow-800";
      case "emergency": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #e879f9 50%, #60a5fa 100%)' }}>
      {/* Header with Back Button */}
      <header className="gradient-primary text-white p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link href="/matches">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 p-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <KrossedLogo size={24} className="text-white" />
            <h1 className="font-poppins font-bold text-xl">Date Safety</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Date Safety Center
            </h1>
            <p className="text-gray-600">
              Stay safe on your dates with real-time check-ins and emergency alerts.
            </p>
          </div>

          {/* Emergency Alert Button */}
          <Card className="mb-8 border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                Emergency Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                If you're in immediate danger, use this button to alert your trusted contacts with your location.
              </p>
              <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-full"
                    data-testid="button-emergency-alert"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Send Emergency Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Emergency Alert</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This will immediately notify your trusted contacts with your location and message.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="emergency-message">Emergency Message</Label>
                      <Textarea
                        id="emergency-message"
                        value={emergencyMessage}
                        onChange={(e) => setEmergencyMessage(e.target.value)}
                        placeholder="Describe your situation..."
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEmergencyDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleEmergencyAlert}
                        disabled={emergencyAlertMutation.isPending}
                        className="flex-1"
                      >
                        {emergencyAlertMutation.isPending ? "Sending..." : "Send Alert"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Upcoming Dates & Check-ins */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Upcoming Dates & Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDates && upcomingDates.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDates.map((date: any) => (
                    <div key={date.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                              src={date.partner.profilePhoto} 
                              alt={date.partner.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{date.partner.name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(date.scheduledTime).toLocaleDateString()} at{' '}
                              {new Date(date.scheduledTime).toLocaleTimeString()}
                            </p>
                            {date.location && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {date.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {date.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </Badge>
                      </div>

                      {/* Date Check-in */}
                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-3">Safety Check-in</h4>
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <Button
                              variant={checkInStatus === "safe" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCheckInStatus("safe")}
                              className={checkInStatus === "safe" ? "bg-green-600" : ""}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              I'm Safe
                            </Button>
                            <Button
                              variant={checkInStatus === "need_help" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCheckInStatus("need_help")}
                              className={checkInStatus === "need_help" ? "bg-yellow-600" : ""}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Need Help
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checkin-message">Optional Message</Label>
                            <Input
                              id="checkin-message"
                              value={checkInMessage}
                              onChange={(e) => setCheckInMessage(e.target.value)}
                              placeholder="How's the date going?"
                            />
                          </div>
                          <Button 
                            onClick={() => handleDateCheckIn(date.id)}
                            disabled={checkInMutation.isPending}
                            className="w-full"
                            data-testid={`button-checkin-${date.id}`}
                          >
                            {checkInMutation.isPending ? "Checking in..." : "Send Check-in"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No upcoming dates scheduled.</p>
                  <p className="text-sm text-gray-500">
                    When you confirm a date, safety check-ins will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trusted Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Trusted Contacts ({trustedContacts?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trustedContacts && trustedContacts.length > 0 ? (
                <div className="space-y-3">
                  {trustedContacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No trusted contacts added</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Add trusted contacts to receive emergency alerts and check-in notifications.
                  </p>
                  <Link href="/safety">
                    <Button variant="outline">
                      Manage Contacts
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}