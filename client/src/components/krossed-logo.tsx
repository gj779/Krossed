import { cn } from "@/lib/utils";

interface KrossedLogoProps {
  size?: number;
  className?: string;
}

export function KrossedLogo({ size = 32, className }: KrossedLogoProps) {
  return (
    <div 
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-current"
      >
        {/* Krossed Pattern - symbolizing paths crossing */}
        <path
          d="M8 8L24 24M24 8L8 24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Heart shapes at intersection points */}
        <circle
          cx="16"
          cy="16"
          r="3"
          fill="currentColor"
          className="opacity-80"
        />
        <path
          d="M13 13C13 11.5 14.5 10 16 11C17.5 10 19 11.5 19 13C19 14.5 16 17 16 17S13 14.5 13 13Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}