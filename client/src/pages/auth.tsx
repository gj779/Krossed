import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import { KrossedLogo } from "@/components/krossed-logo";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { LoginRequest, InsertUser } from "@shared/schema";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    age: "",
    bio: "",
    location: "",
    gender: "",
    sexualOrientation: "",
    interestedInGenders: [] as string[],
    interests: [] as string[],
  });
  
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      toast({ title: "Welcome back!" });
      onAuthSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: InsertUser) => register(data),
    onSuccess: () => {
      toast({ title: "Account created successfully!" });
      onAuthSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password,
      });
    } else {
      const interests = formData.interests.length > 0 ? formData.interests : ["Travel", "Photography"];
      const interestedInGenders = formData.interestedInGenders.length > 0 ? formData.interestedInGenders : 
        formData.gender === "man" ? ["woman"] : formData.gender === "woman" ? ["man"] : ["man", "woman"];
      
      registerMutation.mutate({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        name: formData.name,
        age: parseInt(formData.age),
        bio: formData.bio,
        location: formData.location,
        gender: formData.gender,
        sexualOrientation: formData.sexualOrientation,
        interestedInGenders,
        interests,
        latitude: 40.7589 + (Math.random() - 0.5) * 0.1, // Mock NYC area
        longitude: -73.9851 + (Math.random() - 0.5) * 0.1,
      });
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #ff6b6b 50%, #ffa726 75%, #42a5f5 100%)'
         }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <KrossedLogo size={96} />
          </div>
          <CardTitle className="text-2xl font-poppins font-bold text-gradient">
            {isLogin ? "Welcome to Krossed" : "Join Krossed"}
          </CardTitle>
          <p className="text-lg font-light text-gray-800 mt-2 leading-relaxed tracking-wide italic" 
             style={{
               fontFamily: "'Georgia', 'Times New Roman', serif",
               textShadow: '0 1px 2px rgba(0,0,0,0.1)',
               letterSpacing: '0.5px'
             }}>
            "Crossing paths does not mean it has to end."
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
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
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="man">Man</option>
                      <option value="woman">Woman</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sexualOrientation">Orientation</Label>
                    <select
                      id="sexualOrientation"
                      value={formData.sexualOrientation}
                      onChange={(e) => setFormData(prev => ({ ...prev, sexualOrientation: e.target.value }))}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select orientation</option>
                      <option value="straight">Straight</option>
                      <option value="gay">Gay</option>
                      <option value="lesbian">Lesbian</option>
                      <option value="bisexual">Bisexual</option>
                      <option value="pansexual">Pansexual</option>
                      <option value="questioning">Questioning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Interested in</Label>
                  <div className="flex flex-wrap gap-2">
                    {["men", "women", "non-binary people"].map(gender => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => {
                          const genderValue = gender === "men" ? "man" : gender === "women" ? "woman" : "non-binary";
                          setFormData(prev => ({
                            ...prev,
                            interestedInGenders: prev.interestedInGenders.includes(genderValue)
                              ? prev.interestedInGenders.filter(g => g !== genderValue)
                              : [...prev.interestedInGenders, genderValue]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.interestedInGenders.includes(gender === "men" ? "man" : gender === "women" ? "woman" : "non-binary")
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {gender}
                      </button>
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
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What interests you? (select up to 5)</Label>
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
            )}

            <Button 
              type="submit" 
              className="w-full gradient-primary text-white"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending 
                ? "Loading..." 
                : isLogin ? "Sign In" : "Create Account"
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
