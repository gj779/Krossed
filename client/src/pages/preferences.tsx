import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Users, Heart, MapPin, X } from "lucide-react";
import { Link } from "wouter";

export default function PreferencesPage() {
  const currentUser = getCurrentUser()!;
  const { toast } = useToast();

  const { data: userProfile } = useQuery({
    queryKey: ['/api/user', currentUser.id],
    queryFn: () => fetch(`/api/user/${currentUser.id}`).then(res => res.json()),
  });

  const user = userProfile?.user || currentUser;

  const [preferences, setPreferences] = useState({
    ageRangeMin: user.ageRangeMin || 18,
    ageRangeMax: user.ageRangeMax || 35,
    maxDistance: user.maxDistance || 25,
    dealBreakers: user.dealBreakers || [],
    lookingFor: user.lookingFor || "relationship",
    lifestyle: user.lifestyle || [],
    values: user.values || [],
    meetReadiness: user.meetReadiness || "flexible",
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/user/preferences/${currentUser.id}`, "PUT", data),
    onSuccess: () => {
      toast({ title: "Preferences updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const dealBreakerOptions = [
    "smoking", "drinking", "party_lifestyle", "no_pets", "no_kids", 
    "different_religion", "long_distance", "age_gap", "no_education"
  ];

  const lifestyleOptions = [
    "active", "homebody", "social", "career-focused", "creative", 
    "outdoorsy", "nightlife", "health-conscious", "adventurous"
  ];

  const valuesOptions = [
    "family", "travel", "adventure", "stability", "career", "fitness",
    "spirituality", "education", "creativity", "independence", "tradition"
  ];

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-poppins font-bold text-gradient">
            Matching Preferences
          </h1>
        </div>

        <div className="space-y-6">
          {/* Age Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Age Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Age</Label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={preferences.ageRangeMin}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      ageRangeMin: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                <div>
                  <Label>Maximum Age</Label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={preferences.ageRangeMax}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      ageRangeMax: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Show people aged {preferences.ageRangeMin} to {preferences.ageRangeMax}
              </p>
            </CardContent>
          </Card>

          {/* Distance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Maximum Distance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={[preferences.maxDistance]}
                  onValueChange={(value) => setPreferences(prev => ({ 
                    ...prev, 
                    maxDistance: value[0] 
                  }))}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Show people within {preferences.maxDistance} km
              </p>
            </CardContent>
          </Card>

          {/* Looking For */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Looking For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={preferences.lookingFor} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, lookingFor: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relationship">Long-term Relationship</SelectItem>
                  <SelectItem value="casual">Something Casual</SelectItem>
                  <SelectItem value="friendship">New Friends</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Deal Breakers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="w-5 h-5" />
                Deal Breakers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select things that are absolute no-gos for you
              </p>
              <div className="grid grid-cols-2 gap-3">
                {dealBreakerOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={preferences.dealBreakers.includes(option)}
                      onCheckedChange={(checked) => {
                        setPreferences(prev => ({
                          ...prev,
                          dealBreakers: checked 
                            ? [...prev.dealBreakers, option]
                            : prev.dealBreakers.filter(item => item !== option)
                        }));
                      }}
                    />
                    <Label htmlFor={option} className="text-sm capitalize">
                      {option.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle */}
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                What lifestyle traits are you looking for?
              </p>
              <div className="flex flex-wrap gap-2">
                {lifestyleOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setPreferences(prev => ({
                      ...prev,
                      lifestyle: toggleArrayValue(prev.lifestyle, option)
                    }))}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      preferences.lifestyle.includes(option)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle>Values Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                What values are important to you in a partner?
              </p>
              <div className="flex flex-wrap gap-2">
                {valuesOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setPreferences(prev => ({
                      ...prev,
                      values: toggleArrayValue(prev.values, option)
                    }))}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      preferences.values.includes(option)
                        ? 'bg-secondary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meet Readiness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Meet Readiness
                {currentUser.isPremium && (
                  <Badge variant="secondary" className="text-xs">
                    Premium Filter
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                How soon are you willing to meet someone in person?
              </p>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.meetReadiness}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, meetReadiness: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="within_48h">Within 48 hours</SelectItem>
                  <SelectItem value="this_weekend">This weekend</SelectItem>
                  <SelectItem value="after_coffee_chat">After a coffee chat</SelectItem>
                  <SelectItem value="flexible">Flexible timing</SelectItem>
                </SelectContent>
              </Select>
              {currentUser.isPremium && (
                <p className="text-xs text-purple-600 mt-2">
                  Premium users see timeline alignment scores and get prioritized matches
                </p>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={updatePreferencesMutation.isPending}
            className="w-full gradient-primary text-white py-3"
          >
            {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}