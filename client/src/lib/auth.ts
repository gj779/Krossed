import { User, LoginRequest, InsertUser } from "@shared/schema";
import { apiRequest } from "./queryClient";

let currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return currentUser;
}

export function setCurrentUser(user: User | null) {
  currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser"); window.location.reload();
  }
}

export function initAuth() {
  // Clear any stored authentication state on init to force fresh login
  localStorage.removeItem("currentUser");
  currentUser = null;
}

export async function login(credentials: LoginRequest): Promise<User> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  const data = await response.json();
  setCurrentUser(data.user);
  return data.user;
}

export async function register(userData: InsertUser): Promise<User> {
  const response = await apiRequest('POST', '/api/auth/register', userData);
  const data = await response.json();
  setCurrentUser(data.user);
  return data.user;
}

export function logout() {
  setCurrentUser(null);
  localStorage.removeItem('currentUser');
  window.location.href = '/';
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}
