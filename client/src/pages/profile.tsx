import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Edit3, Crown, MapPin, Briefcase, LogOut, Camera, Heart, Users, X, CreditCard, Calendar, Shield, ShieldCheck } from "lucide-react";
import { KrossedLogo } from "@/components/krossed-logo";
import { VerifiedBadge } from "@/components/verified-badge";
import { SocialShare } from "@/components/social-share";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const currentUser = getCurrentUser()!;
  const [formData, setFormData] = useState({
    name: currentUser.name,
    age: currentUser.age,
    bio: currentUser.bio || "",
    location: currentUser.location || "",
    interests: [...(currentUser.interests || [])],
    gender: currentUser.gender || "",
    sexualOrientation: currentUser.sexualOrientation || "",
    interestedInGenders: [...(currentUser.interestedInGenders || [])],
    occupation: currentUser.occupation || "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscription status query
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: false,
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/cancel', {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Subscription canceled", description: "Your subscription will end at the current period" });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/reactivate', {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Subscription reactivated!", description: "Your premium features are active again" });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reactivate subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      const response = await apiRequest('PUT', `/api/user/${currentUser.id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      // Update current user in auth
      const updatedUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      toast({ title: "Profile updated successfully!" });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      age: currentUser.age,
      bio: currentUser.bio || "",
      location: currentUser.location || "",
      interests: [...(currentUser.interests || [])],
      gender: currentUser.gender || "",
      sexualOrientation: currentUser.sexualOrientation || "",
      interestedInGenders: [...(currentUser.interestedInGenders || [])],
      occupation: currentUser.occupation || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const commonInterests = [
    "Travel", "Photography", "Music", "Art", "Fitness", "Cooking",
    "Books", "Movies", "Gaming", "Hiking", "Coffee", "Dancing"
  ];

  const getLastActiveText = () => {
    const diffMs = Date.now() - new Date(currentUser.lastActive || new Date()).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 5) return "Active now";
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Active ${diffDays}d ago`;
  };

  // Helper function to determine interested genders based on orientation and gender
  const getInterestedGenders = (userGender: string, orientation: string): string[] => {
    if (orientation === "straight") {
      if (userGender === "man") return ["woman"];
      if (userGender === "woman") return ["man"];
      return ["man", "woman"]; // non-binary straight
    } else if (orientation === "gay") {
      return [userGender]; // same gender
    } else if (orientation === "bisexual") {
      return ["man", "woman"];
    } else if (orientation === "pansexual") {
      return ["man", "woman", "non-binary"];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white p-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KrossedLogo size={24} className="text-white" />
            <h1 className="font-poppins font-bold text-base">Profile</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20 text-xs px-2 py-1"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-3 pb-20 space-y-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-gray-200">
                  <img
                    src={currentUser.profilePhoto || "https://via.placeholder.com/200"}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full w-7 h-7 p-0"
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h2 className="text-lg font-bold">{currentUser.name}, {currentUser.age}</h2>
                {currentUser.isPremium && (
                  <Badge className="gradient-accent text-black text-xs px-2 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    PREMIUM
                  </Badge>
                )}
                {currentUser.isPhotoVerified && (
                  <VerifiedBadge 
                    isVerified={currentUser.isPhotoVerified} 
                    verificationDate={new Date('2025-01-15')}
                    size="sm"
                  />
                )}
              </div>
              
              <p className="text-xs text-gray-600">{getLastActiveText()}</p>
            </div>

            <div className="space-y-3 text-sm">
              {currentUser.occupation && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span>{currentUser.occupation}</span>
                </div>
              )}
              
              {currentUser.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{currentUser.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Profile Information</CardTitle>
              {!isEditing ? (
                <div className="flex items-center space-x-2">
                  <SocialShare user={currentUser} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="gradient-primary text-white"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="man">Man</SelectItem>
                        <SelectItem value="woman">Woman</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="Your job/profession"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sexualOrientation">Sexual Orientation</Label>
                  <Select
                    value={formData.sexualOrientation}
                    onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        sexualOrientation: value,
                        // Auto-populate interested genders based on orientation and gender
                        interestedInGenders: getInterestedGenders(formData.gender, value)
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="gay">Gay</SelectItem>
                      <SelectItem value="bisexual">Bisexual</SelectItem>
                      <SelectItem value="pansexual">Pansexual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interested In</Label>
                  <div className="space-y-2">
                    {["man", "woman", "non-binary"].map(gender => (
                      <div key={gender} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interested-${gender}`}
                          checked={formData.interestedInGenders.includes(gender)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                interestedInGenders: [...prev.interestedInGenders, gender]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                interestedInGenders: prev.interestedInGenders.filter(g => g !== gender)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`interested-${gender}`} className="capitalize">
                          {gender === "non-binary" ? "Non-binary" : gender}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell people about yourself..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonInterests.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          formData.interests.includes(interest)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        disabled={!formData.interests.includes(interest) && formData.interests.length >= 5}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {currentUser.bio && (
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-gray-600">{currentUser.bio}</p>
                  </div>
                )}

                {currentUser.interests && currentUser.interests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className={subscriptionData?.isPremium ? "border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50" : "border-accent"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              {subscriptionData?.isPremium ? "Premium Active" : "Premium Subscription"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionData?.isPremium ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Premium Active
                  </Badge>
                  <span className="text-sm text-gray-600 capitalize">{(subscriptionData as any).status}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(subscriptionData as any).trial_end && (
                    <div>
                      <p className="text-gray-600">Trial ends</p>
                      <p className="font-medium">
                        {new Date((subscriptionData as any).trial_end * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {(subscriptionData as any).current_period_end && (
                    <div>
                      <p className="text-gray-600">Next billing</p>
                      <p className="font-medium">
                        {new Date((subscriptionData as any).current_period_end * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {(subscriptionData as any).cancel_at_period_end ? (
                    <div className="space-y-2">
                      <p className="text-sm text-orange-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Subscription will cancel at period end
                      </p>
                      <Button 
                        onClick={() => reactivateSubscriptionMutation.mutate()}
                        disabled={reactivateSubscriptionMutation.isPending}
                        className="w-full"
                        variant="default"
                      >
                        {reactivateSubscriptionMutation.isPending ? "Reactivating..." : "Reactivate Subscription"}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => cancelSubscriptionMutation.mutate()}
                      disabled={cancelSubscriptionMutation.isPending}
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      {cancelSubscriptionMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Crown className="w-12 h-12 text-accent mx-auto" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Unlimited swipes, enhanced matching, priority discovery, and exclusive features
                  </p>
                </div>
                <Link href="/subscribe">
                  <Button className="gradient-primary text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Start 7-Day Free Trial
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/security">
              <Button variant="outline" className="w-full justify-start">
                <ShieldCheck className="w-4 h-4 mr-3" />
                Security & Verification
              </Button>
            </Link>
            <Link href="/preferences">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-3" />
                Dating Preferences
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {currentUser.isPremium ? '∞' : (15 - (currentUser.dailyViewsUsed || 0))}
                </div>
                <div className="text-sm text-gray-600">Views Left Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">3</div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
