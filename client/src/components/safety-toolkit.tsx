import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, MapPin, Phone, Eye, EyeOff, MessageCircle, Clock, Share2, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SafetyToolkitProps {
  userId: string;
  matchId?: string;
  isOnDate?: boolean;
}

export function SafetyToolkit({ userId, matchId, isOnDate = false }: SafetyToolkitProps) {
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [ghostDialogOpen, setGhostDialogOpen] = useState(false);
  const [emergencyShareDialogOpen, setEmergencyShareDialogOpen] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [ghostReason, setGhostReason] = useState("");
  const [shareType, setShareType] = useState<"location_only" | "full_details" | "panic_mode">("location_only");
  const { toast } = useToast();

  // Get current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number; address?: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Emergency alert mutation
  const emergencyAlertMutation = useMutation({
    mutationFn: async (alertData: { alertType: string; additionalInfo?: string }) => {
      const location = await getCurrentLocation();
      const response = await apiRequest('POST', '/api/safety/emergency-alert', {
        ...alertData,
        location: JSON.stringify(location)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency alert sent!",
        description: "Your trusted contacts have been notified with your location.",
        variant: "default",
      });
      setEmergencyDialogOpen(false);
      setAdditionalInfo("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send emergency alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ghost profile mutation
  const ghostProfileMutation = useMutation({
    mutationFn: async (data: { ghostedId: string; reason?: string }) => {
      const response = await apiRequest('POST', '/api/safety/ghost-profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile ghosted successfully",
        description: "This user can no longer see or interact with your profile.",
      });
      setGhostDialogOpen(false);
      setGhostReason("");
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to ghost profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Date check-in mutation
  const dateCheckInMutation = useMutation({
    mutationFn: async (status: "safe" | "help_needed") => {
      const location = await getCurrentLocation();
      const response = await apiRequest('POST', '/api/safety/date-checkin', {
        matchId,
        status,
        location: JSON.stringify(location),
        needsHelp: status === "help_needed"
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.status === "safe" ? "Check-in recorded" : "Help request sent",
        description: data.status === "safe" 
          ? "Thanks for letting us know you're safe!" 
          : "Your trusted contacts have been notified that you need help.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // One-click emergency share mutation
  const emergencyShareMutation = useMutation({
    mutationFn: async (shareData: { shareType: string; dateDetails?: string }) => {
      const location = await getCurrentLocation();
      const response = await apiRequest('POST', '/api/safety/emergency-share', {
        ...shareData,
        matchId,
        location: JSON.stringify(location),
        dateDetails: shareData.dateDetails || `Emergency contact share during date - ${new Date().toLocaleString()}`
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Emergency contacts notified!",
        description: `${data.share.contactsNotified} trusted contacts have been notified with your location and details.`,
        variant: "default",
      });
      setEmergencyShareDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/safety'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to notify emergency contacts",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get trusted contacts
  const { data: trustedContacts } = useQuery({
    queryKey: ['/api/safety/trusted-contacts'],
    retry: false,
  });

  const handleEmergencyAlert = (alertType: string) => {
    emergencyAlertMutation.mutate({ alertType, additionalInfo });
  };

  const handleEmergencyShare = () => {
    emergencyShareMutation.mutate({ 
      shareType,
      dateDetails: `One-click emergency share: ${shareType} - ${new Date().toLocaleString()}`
    });
  };

  return (
    <div className="space-y-4">
      {/* Emergency Alert Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-red-600">
            Immediately send your location to trusted contacts
          </p>
          
          <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                EMERGENCY ALERT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-700">Send Emergency Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    This will immediately send your current location to all trusted contacts.
                    {trustedContacts?.length === 0 && (
                      <span className="block mt-2 font-medium">
                        ⚠️ You have no trusted contacts set up. Add them in your profile first.
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional information (optional)</label>
                  <Textarea 
                    placeholder="Brief description of the situation..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEmergencyAlert("emergency")}
                    disabled={emergencyAlertMutation.isPending || trustedContacts?.length === 0}
                    variant="destructive"
                    className="flex-1"
                  >
                    {emergencyAlertMutation.isPending ? "Sending..." : "Send Alert"}
                  </Button>
                  <Button 
                    onClick={() => setEmergencyDialogOpen(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* One-Click Emergency Contact Share */}
      {isOnDate && matchId && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Share2 className="h-5 w-5" />
              One-Click Emergency Share
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-orange-600">
              Instantly share your location and date details with emergency contacts
            </p>
            
            <Dialog open={emergencyShareDialogOpen} onOpenChange={setEmergencyShareDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share with Emergency Contacts
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-orange-700">Emergency Contact Share</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-800">
                      This will instantly share your information with emergency contacts.
                      {trustedContacts?.filter(c => c.isEmergencyContact).length === 0 && (
                        <span className="block mt-2 font-medium">
                          ⚠️ You have no emergency contacts set up. Add them in your profile first.
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Share Type</label>
                    <Select value={shareType} onValueChange={(value: any) => setShareType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="location_only">
                          📍 Location Only
                          <div className="text-xs text-gray-500 mt-1">Share current location (auto-resolves in 2h)</div>
                        </SelectItem>
                        <SelectItem value="full_details">
                          📋 Full Date Details  
                          <div className="text-xs text-gray-500 mt-1">Location + date info + match details (auto-resolves in 4h)</div>
                        </SelectItem>
                        <SelectItem value="panic_mode">
                          🚨 Panic Mode
                          <div className="text-xs text-gray-500 mt-1">Immediate emergency with all details (manual resolve only)</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Emergency contacts will receive:</span>
                    </div>
                    <ul className="space-y-1 ml-6">
                      <li>• Your current location</li>
                      {shareType !== "location_only" && <li>• Date details and match information</li>}
                      {shareType === "panic_mode" && <li>• Immediate emergency alert notification</li>}
                      <li>• Timestamp and share type</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleEmergencyShare}
                      disabled={emergencyShareMutation.isPending || trustedContacts?.filter(c => c.isEmergencyContact).length === 0}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {emergencyShareMutation.isPending ? "Sharing..." : "Share Now"}
                    </Button>
                    <Button 
                      onClick={() => setEmergencyShareDialogOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* In-Date Check-ins */}
      {isOnDate && matchId && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              Date Safety Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-600">
              Let us know how things are going
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={() => dateCheckInMutation.mutate("safe")}
                disabled={dateCheckInMutation.isPending}
                variant="outline"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                I'm Safe
              </Button>
              <Button
                onClick={() => dateCheckInMutation.mutate("help_needed")}
                disabled={dateCheckInMutation.isPending}
                variant="outline" 
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Phone className="h-4 w-4 mr-2" />
                Need Help
              </Button>
            </div>

            {dateCheckInMutation.isPending && (
              <p className="text-xs text-blue-600">Sending check-in...</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ghost Profile Section */}
      {matchId && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <EyeOff className="h-5 w-5" />
              Ghost Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-purple-600">
              Hide your profile from this user permanently
            </p>
            
            <Dialog open={ghostDialogOpen} onOpenChange={setGhostDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-100"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ghost This Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-purple-700">Ghost Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800">
                      This user will no longer be able to:
                    </p>
                    <ul className="text-sm text-purple-700 mt-2 space-y-1">
                      <li>• See your profile in discovery</li>
                      <li>• Re-match with you</li>
                      <li>• View your photos or information</li>
                      <li>• Send you messages</li>
                    </ul>
                    <p className="text-xs text-purple-600 mt-2">
                      This action cannot be undone.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason (optional)</label>
                    <Textarea 
                      placeholder="Why are you ghosting this profile?"
                      value={ghostReason}
                      onChange={(e) => setGhostReason(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => ghostProfileMutation.mutate({ ghostedId: matchId, reason: ghostReason })}
                      disabled={ghostProfileMutation.isPending}
                      variant="default"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {ghostProfileMutation.isPending ? "Ghosting..." : "Ghost Profile"}
                    </Button>
                    <Button 
                      onClick={() => setGhostDialogOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Safety Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Trusted Contacts</span>
            <Badge variant="outline">
              {trustedContacts?.length || 0} contacts
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Location Sharing</span>
            <Badge variant="outline" className="text-green-600">
              <MapPin className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}