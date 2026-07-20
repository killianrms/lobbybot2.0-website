export interface DiscordAuthState {
  authenticated: boolean;
  discordId?: string;
  username?: string;
  premium?: {
    source: string;
    grantedAt: string | null;
    expiresAt: string | null;
  } | null;
}

export interface PremiumBot {
  name: string;
  isOnline: boolean;
  friends: number;
  ping: number | null;
}

export interface Preset {
  name: string;
  outfit?: string;
  backpack?: string;
  pickaxe?: string;
  emote?: string;
  isActive: boolean;
}
