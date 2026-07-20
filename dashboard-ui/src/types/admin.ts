export type Role = "admin" | "premium";

export interface AuthState {
  authenticated: boolean;
  email?: string;
  role?: Role;
}

export interface Bot {
  name: string;
  email?: string;
  isOnline: boolean;
  friends: number;
  ping: number | null;
  fromDB?: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  role: Role;
  created_at: string;
}

export interface GlobalConfig {
  status: string;
  joinMsg: string;
  addMsg: string;
}

export interface ActivityEntry {
  id: number;
  timestamp: string;
  icon: string;
  type: string;
  bot?: string;
  message?: string;
  target?: string;
  action?: string;
}

export interface PremiumGrant {
  discordId: string;
  source: string;
  grantedAt: string;
  expiresAt: string | null;
  active: boolean;
  epicPseudo: string | null;
}

export interface WebDiscordUser {
  discordId: string;
  username: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  isPremium: boolean;
  epicPseudo: string | null;
}
