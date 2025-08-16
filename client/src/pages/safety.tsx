import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafetyToolkit } from "@/components/safety-toolkit";
import { Link } from "wouter";
import { KrossedLogo } from "@/components/krossed-logo";
import { Shield, AlertTriangle, Eye, Clock, UserX, Users, Phone, MapPin, ArrowLeft } from "lucide-react";

export default function SafetyPage() {
  const currentUser = getCurrentUser()!;
  const [activeTab, setActiveTab] = useState<"toolkit" | "history" | "contacts">("toolkit");

  // Get safety data
  const { data: emergencyAlerts } = useQuery({
    queryKey: ['/api/safety/emergency-alerts'],
    retry: false,
  });

  const { data: trustedContacts } = useQuery({
    queryKey: ['/api/safety/trusted-contacts'],
    retry: false,
  });

  const { data: dateCheckIns } = useQuery({
    queryKey: ['/api/safety/date-checkins'],
    retry: false,
  });

  const activeAlerts = emergencyAlerts?.filter((alert: any) => alert.status === 'active') || [];
  const recentCheckIns = dateCheckIns?.slice(0, 5) || [];

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
            <h1 className="font-poppins font-bold text-xl">Safety Toolkit</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              In-App Safety Toolkit
            </h1>
            <p className="text-gray-600">
              Your security and safety are our top priority. Use these tools to stay safe while connecting.
            </p>
          </div>

          {/* Safety Status Overview */}
          <Card className="mb-8 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Shield className="h-6 w-6" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {trustedContacts?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Trusted Contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {recentCheckIns.length}
                  </div>
                  <div className="text-sm text-blue-700">Recent Check-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {activeAlerts.length}
                  </div>
                  <div className="text-sm text-purple-700">Active Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Emergency Alerts */}
          {activeAlerts.length > 0 && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Active Emergency Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div>
                        <div className="font-medium text-red-800">
                          {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)} Alert
                        </div>
                        <div className="text-sm text-red-600">
                          Triggered {new Date(alert.triggeredAt).toLocaleString()}
                        </div>
                        {alert.additionalInfo && (
                          <div className="text-sm text-red-600 mt-1">
                            {alert.additionalInfo}
                          </div>
                        )}
                      </div>
                      <Badge variant="destructive">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === "toolkit" ? "default" : "ghost"}
              onClick={() => setActiveTab("toolkit")}
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Safety Toolkit
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              onClick={() => setActiveTab("history")}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Safety History
            </Button>
            <Button
              variant={activeTab === "contacts" ? "default" : "ghost"}
              onClick={() => setActiveTab("contacts")}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Trusted Contacts
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === "toolkit" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Safety Tools</CardTitle>
                  <p className="text-sm text-gray-600">
                    Use these tools during dates or when you feel unsafe
                  </p>
                </CardHeader>
                <CardContent>
                  <SafetyToolkit userId={currentUser.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Safety Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Emergency Location Sharing</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Instantly share your live location with trusted contacts during emergencies
                      </p>
                      <Badge variant="outline" className="text-green-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Profile Ghosting</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Hide your profile from users after bad experiences permanently
                      </p>
                      <Badge variant="outline" className="text-blue-600">
                        <UserX className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Date Check-ins</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Periodic safety check-ins during first meetups with emergency escalation
                      </p>
                      <Badge variant="outline" className="text-purple-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Auto-enabled
                      </Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">24/7 Support</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Report issues and get help from our safety team any time
                      </p>
                      <Badge variant="outline" className="text-orange-600">
                        <Phone className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Safety Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckIns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No safety activity yet</p>
                    <p className="text-sm">Your safety check-ins and alerts will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCheckIns.map((checkIn: any) => (
                      <div key={checkIn.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            Date Check-in: {checkIn.status === 'safe' ? 'Safe' : checkIn.status === 'help_needed' ? 'Help Requested' : 'Pending'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(checkIn.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            checkIn.status === 'safe' ? 'default' : 
                            checkIn.status === 'help_needed' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {checkIn.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "contacts" && (
            <Card>
              <CardHeader>
                <CardTitle>Trusted Contacts</CardTitle>
                <p className="text-sm text-gray-600">
                  Contacts who will be notified during emergencies
                </p>
              </CardHeader>
              <CardContent>
                {!trustedContacts || trustedContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No trusted contacts added yet</p>
                    <Button>Add Trusted Contact</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trustedContacts.map((contact: any) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{contact.contactName}</div>
                          <div className="text-sm text-gray-600">{contact.relationship}</div>
                          <div className="text-sm text-gray-500">{contact.contactPhone}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.isEmergencyContact && (
                            <Badge variant="destructive" className="text-xs">Emergency</Badge>
                          )}
                          {contact.canReceiveLocationSharing && (
                            <Badge variant="outline" className="text-xs">Location</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Safety Tips */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Before Meeting</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Meet in public places</li>
                    <li>• Tell a friend your plans</li>
                    <li>• Share your location</li>
                    <li>• Trust your instincts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">During Dates</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use date check-ins</li>
                    <li>• Keep emergency contacts handy</li>
                    <li>• Don't share personal info too quickly</li>
                    <li>• Have your own transportation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}