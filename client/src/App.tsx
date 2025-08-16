import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import { initAuth, getCurrentUser, isAuthenticated } from "@/lib/auth";
import AuthPage from "@/pages/auth";
import HomePage from "@/pages/home";
import MatchesPage from "@/pages/matches";
import MessagesPage from "@/pages/messages";
import ProfilePage from "@/pages/profile";
import PreferencesPage from "@/pages/preferences";
import Subscribe from "@/pages/subscribe";
import Events from "@/pages/events";
import Security from "@/pages/security";
import SafetyPage from "@/pages/safety";
import DateSafetyPage from "@/pages/date-safety";
import PublicProfile from "@/pages/public-profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [activeTab, setActiveTab] = useState("discover");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    initAuth();
    setIsAuthReady(true);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthReady(true);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const currentUser = getCurrentUser()!;

  // Handle special routes that don't use bottom navigation
  if (location === '/subscribe') {
    return <Subscribe />;
  }
  
  if (location === '/security') {
    return <Security />;
  }

  if (location.startsWith('/profile/')) {
    return <PublicProfile />;
  }
  
  if (location === '/safety') {
    return <SafetyPage />;
  }
  
  if (location === '/date-safety') {
    return <DateSafetyPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case "discover":
        return <HomePage />;
      case "matches":
        return <MatchesPage />;
      case "messages":
        return <MessagesPage />;
      case "profile":
        return <ProfilePage />;
      case "events":
        return <Events />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl overflow-hidden">
      <div className="pb-20 min-h-screen">
        {renderPage()}
      </div>
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        matchCount={3} // This would come from actual match count
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
