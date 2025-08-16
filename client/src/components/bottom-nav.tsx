import { Heart, MessageCircle, User, Layers, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  matchCount?: number;
}

export function BottomNav({ activeTab, onTabChange, matchCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: "discover", icon: Layers, label: "Discover" },
    { id: "matches", icon: Heart, label: "Matches", badge: matchCount },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-50 shadow-lg">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 p-3 relative min-w-[60px] transition-all duration-200 ${
              activeTab === tab.id 
                ? "text-primary bg-primary/10 rounded-lg" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium truncate">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-primary hover:bg-primary flex items-center justify-center p-0 rounded-full">
                {tab.badge > 9 ? '9+' : tab.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}
