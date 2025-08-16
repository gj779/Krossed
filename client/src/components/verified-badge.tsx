import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, CheckCircle, Zap, Star } from "lucide-react";
import { format } from "date-fns";

interface VerifiedBadgeProps {
  isVerified: boolean;
  verificationDate?: Date | string | null;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

interface VerifiedIconProps {
  isVerified: boolean;
  verificationDate?: Date | string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({ 
  isVerified, 
  verificationDate, 
  size = "md", 
  showTooltip = true,
  className = "" 
}: VerifiedBadgeProps) {
  if (!isVerified) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const formatVerificationDate = (date: Date | string | null) => {
    if (!date) return "Verification date unknown";
    
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return format(parsedDate, "MMM d, yyyy");
    } catch {
      return "Verification date unknown";
    }
  };

  const badge = (
    <div 
      className={`
        relative inline-flex items-center gap-1.5 font-bold tracking-tight overflow-hidden
        bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white
        transform skew-x-[-8deg] border-2 border-white shadow-lg hover:shadow-xl
        transition-all duration-300 hover:scale-105
        ${sizeClasses[size]} ${className}
      `}
    >
      <div className="transform skew-x-[8deg] flex items-center gap-1.5">
        <Zap className={`${iconSizes[size]} text-yellow-300 fill-current drop-shadow-sm`} />
        <span className="uppercase font-black">VERIFIED</span>
      </div>
      {/* Animated shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    transform -translate-x-full animate-pulse duration-2000"></div>
      {/* Edge highlights */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">Verified Human</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This user has completed photo verification to confirm their identity.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Last verified: {formatVerificationDate(verificationDate ?? null)}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

// Alternative compact version for use in cards
export function VerifiedIcon({ 
  isVerified, 
  verificationDate, 
  size = "sm",
  className = "" 
}: VerifiedIconProps) {
  if (!isVerified) {
    return null;
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const formatVerificationDate = (date: Date | string | null) => {
    if (!date) return "Verification date unknown";
    
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return format(parsedDate, "MMM d, yyyy");
    } catch {
      return "Verification date unknown";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`inline-flex relative ${className}`}>
          <div className="relative transform rotate-12 overflow-hidden">
            {/* Diamond-shaped container with gradient */}
            <div className={`flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 border-2 border-white shadow-lg clip-path-diamond transform transition-all duration-300 hover:scale-110 ${iconSizes[size]}`}>
              <Star className="h-3 w-3 text-yellow-300 fill-current transform -rotate-12" />
            </div>
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
                          transform -translate-x-full animate-pulse duration-1500"></div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-purple-500 fill-current" />
          <span className="font-semibold">Verified Human</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This user has completed photo verification to confirm their identity.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Last verified: {formatVerificationDate(verificationDate ?? null)}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}