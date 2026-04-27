"use client";

export interface AuthUser {
  user_id: string;
  email: string;
  plan: string;
  is_admin: boolean;
  trial_ends_at: string | null; // ISO string
}

const TOKEN_KEY = "token";
const USER_KEY  = "auth_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "token=; path=/; max-age=0";
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Returns days remaining in trial (0 if expired, null if admin/paid). */
export function trialDaysRemaining(user: AuthUser): number | null {
  if (user.is_admin || user.plan === "pro" || user.plan === "team") return null;
  if (!user.trial_ends_at) return null;
  const ms = new Date(user.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
