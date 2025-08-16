import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, ShieldCheck, Eye, Lock, Phone, Mail, Camera, Users, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { KrossedLogo } from "@/components/krossed-logo";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const trustedContactSchema = z.object({
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional(),
  relationship: z.string().min(1, "Relationship is required"),
  isEmergencyContact: z.boolean().default(false),
  canReceiveLocationSharing: z.boolean().default(false)
});

export default function Security() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user security data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Default user properties for security page
  const securityUser = user || {
    isEmailVerified: false,
    isPhoneVerified: false,
    isPhotoVerified: false,
    isIdVerified: false,
    twoFactorEnabled: false
  };

  const { data: securityLogs } = useQuery({
    queryKey: ["/api/security/logs"],
    enabled: !!user,
  });

  const { data: trustedContacts } = useQuery({
    queryKey: ["/api/security/trusted-contacts"],
    enabled: !!user,
  });

  const { data: photoVerification } = useQuery({
    queryKey: ["/api/security/photo-verification"],
    enabled: !!user,
  });

  // Change password form
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Trusted contact form
  const contactForm = useForm({
    resolver: zodResolver(trustedContactSchema),
    defaultValues: {
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      relationship: "",
      isEmergencyContact: false,
      canReceiveLocationSharing: false
    }
  });

  // Mutations
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
      const { confirmPassword, ...payload } = data;
      return apiRequest("POST", "/api/security/change-password", payload);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const addTrustedContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trustedContactSchema>) => {
      return apiRequest("POST", "/api/security/trusted-contacts", data);
    },
    onSuccess: () => {
      toast({
        title: "Trusted Contact Added",
        description: "Your trusted contact has been added successfully.",
      });
      contactForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/security/trusted-contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Contact",
        description: error.message || "Failed to add trusted contact",
        variant: "destructive",
      });
    },
  });

  const enablePhotoVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/security/photo-verification/start");
    },
    onSuccess: () => {
      toast({
        title: "Photo Verification Started",
        description: "Please follow the instructions to verify your photos.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/security/photo-verification"] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to start photo verification",
        variant: "destructive",
      });
    },
  });

  if (!securityUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-muted-foreground">Please log in to access security settings.</p>
        </div>
      </div>
    );
  }

  const getVerificationLevel = () => {
    let level = 0;
    if (securityUser.isEmailVerified) level += 1;
    if (securityUser.isPhoneVerified) level += 1;
    if (securityUser.isPhotoVerified) level += 1;
    if (securityUser.isIdVerified) level += 1;
    return level;
  };

  const verificationLevel = getVerificationLevel();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e879f9 0%, #f472b6 50%, #60a5fa 100%)' }}>
      {/* Header with Back Button */}
      <header className="gradient-primary text-white p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
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
            <h1 className="font-poppins font-bold text-xl">Security & Safety</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="contacts">Safety Contacts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verification Level</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verificationLevel}/4</div>
                <p className="text-xs text-muted-foreground">
                  {verificationLevel === 4 ? "Fully verified" : `${4 - verificationLevel} steps remaining`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Account in good standing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Features</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trustedContacts?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Trusted contacts added
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Improve your account security with these recommended actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!securityUser.isEmailVerified && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Verify your email address for account security</span>
                </div>
              )}
              
              {!securityUser.isPhotoVerified && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Add photo verification to increase trust</span>
                </div>
              )}

              {!securityUser.twoFactorEnabled && (
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Enable two-factor authentication for extra protection</span>
                </div>
              )}

              {(trustedContacts?.length || 0) === 0 && (
                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Add trusted contacts for safety when meeting new people</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Verification</CardTitle>
              <CardDescription>
                Verify your identity to increase trust and safety for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Email Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify your email address</p>
                    </div>
                  </div>
                  <Badge variant={securityUser.isEmailVerified ? "default" : "secondary"}>
                    {securityUser.isEmailVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Phone Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify your phone number</p>
                    </div>
                  </div>
                  <Badge variant={securityUser.isPhoneVerified ? "default" : "secondary"}>
                    {securityUser.isPhoneVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Photo Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify your profile photos match your identity</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={securityUser.isPhotoVerified ? "default" : "secondary"}>
                      {securityUser.isPhotoVerified ? "Verified" : "Pending"}
                    </Badge>
                    {!securityUser.isPhotoVerified && (
                      <Button 
                        size="sm" 
                        onClick={() => enablePhotoVerificationMutation.mutate()}
                        disabled={enablePhotoVerificationMutation.isPending}
                      >
                        Start Verification
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">ID Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify your government-issued ID</p>
                    </div>
                  </div>
                  <Badge variant={securityUser.isIdVerified ? "default" : "secondary"}>
                    {securityUser.isIdVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form 
                  onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">2FA Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {securityUser.twoFactorEnabled ? "Two-factor authentication is enabled" : "Two-factor authentication is disabled"}
                  </p>
                </div>
                <Badge variant={securityUser.twoFactorEnabled ? "default" : "secondary"}>
                  {securityUser.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {!securityUser.twoFactorEnabled && (
                <Button className="mt-4" variant="outline">
                  Enable 2FA
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Trusted Contact</CardTitle>
              <CardDescription>
                Add people who can be contacted in case of emergency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...contactForm}>
                <form 
                  onSubmit={contactForm.handleSubmit((data) => addTrustedContactMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contactForm.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input placeholder="Friend, Family, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contactForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={addTrustedContactMutation.isPending}
                  >
                    {addTrustedContactMutation.isPending ? "Adding..." : "Add Contact"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {trustedContacts && trustedContacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Trusted Contacts</CardTitle>
                <CardDescription>
                  People who can be contacted for safety check-ins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trustedContacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{contact.contactName}</h4>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        {contact.contactPhone && (
                          <p className="text-sm text-muted-foreground">{contact.contactPhone}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {contact.isEmergencyContact && (
                          <Badge variant="destructive" className="text-xs">Emergency</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>
                Monitor your account activity and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityLogs && securityLogs.length > 0 ? (
                <div className="space-y-3">
                  {securityLogs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium capitalize">{log.eventType.replace(/_/g, ' ')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No security activity to display
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}