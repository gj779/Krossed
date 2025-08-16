import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Heart, MapPin, Clock, Target, Shield, MessageCircle, Type, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { KrossedLogo } from "@/components/krossed-logo";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Premium!",
        description: "Your subscription is now active. Enjoy unlimited features!",
      });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full gradient-primary text-white font-bold py-3"
      >
        {isLoading ? "Processing..." : "Start Premium Subscription"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check current subscription status
    const checkStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/subscription/status");
        const data = await response.json();
        setSubscriptionStatus(data);

        // If no subscription, create one
        if (!data.hasSubscription) {
          const subResponse = await apiRequest("POST", "/api/create-subscription", {});
          const subData = await subResponse.json();
          if (subData.clientSecret) {
            setClientSecret(subData.clientSecret);
          }
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        toast({
          title: "Error",
          description: "Failed to check subscription status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e879f9 0%, #f472b6 50%, #60a5fa 100%)' }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth">
              <Button className="w-full gradient-primary text-white">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e879f9 0%, #f472b6 50%, #60a5fa 100%)' }}>
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // If user already has premium
  if (subscriptionStatus?.isPremium) {
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
              <h1 className="font-poppins font-bold text-xl">Premium Status</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">You're Premium!</h1>
            </div>
            <p className="text-gray-600">You're already enjoying all premium features</p>
          </div>

          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Premium Features Active
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Unlimited swipes & super likes</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span><strong>Unlimited messaging</strong> (vs 10 msg limit)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span><strong>Extended character limits</strong> (500 chars)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Enhanced compatibility matching</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Priority discovery placement</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Match extensions & travel freeze</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Timeline alignment filters</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Premium badge & verification</span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Subscription Status: <Badge variant="outline" className="ml-1">{subscriptionStatus.status}</Badge>
            </p>
            {subscriptionStatus.trial_end && (
              <p className="text-sm text-gray-600">
                Trial ends: {new Date(subscriptionStatus.trial_end * 1000).toLocaleDateString()}
              </p>
            )}
            <Link href="/profile">
              <Button variant="outline">
                Back to Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="font-poppins font-bold text-xl">Upgrade to Premium</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock unlimited features and find your perfect match faster with enhanced algorithms and priority placement
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Features Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Premium Features
              </CardTitle>
              <CardDescription>
                Everything you need for the ultimate dating experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Unlimited Swipes & Super Likes</p>
                    <p className="text-sm text-gray-600">No daily limits on discovering new connections</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-purple-800">Unlimited Messaging</p>
                    <p className="text-sm text-purple-600">Send unlimited messages vs 10 message limit for free users</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Type className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="font-medium">Extended Character Limits</p>
                    <p className="text-sm text-gray-600">Write longer messages (500 chars vs 200 for free users)</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Enhanced Compatibility Matching</p>
                    <p className="text-sm text-gray-600">Advanced algorithms find your most compatible matches</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Priority Discovery</p>
                    <p className="text-sm text-gray-600">Appear first in others' discovery queues</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Match Extensions & Travel Freeze</p>
                    <p className="text-sm text-gray-600">Extend match timers and pause while traveling</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Timeline Alignment Filters</p>
                    <p className="text-sm text-gray-600">Filter matches by meeting preferences and availability</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Premium Badge</p>
                    <p className="text-sm text-gray-600">Stand out with exclusive premium styling</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">$9.99/month</p>
                  <p className="text-sm text-gray-600">7-day free trial • Cancel anytime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Start Your Premium Journey</CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Preparing subscription...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-600">Yes, you can cancel your subscription at any time from your profile settings. You'll keep premium features until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">What happens after the free trial?</h3>
              <p className="text-sm text-gray-600">After your 7-day free trial, you'll be charged $9.99/month. You can cancel before the trial ends to avoid any charges.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Are my payments secure?</h3>
              <p className="text-sm text-gray-600">Absolutely. All payments are processed securely through Stripe, and we never store your payment information.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Can I upgrade from the app?</h3>
              <p className="text-sm text-gray-600">Yes, you can manage your subscription from your profile settings on any device where you're logged in.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}