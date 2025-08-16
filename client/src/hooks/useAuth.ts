import { getCurrentUser, isAuthenticated } from "@/lib/auth";

export function useAuth() {
  const user = getCurrentUser();
  
  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading: false
  };
}