import type { Language } from "@/i18n/LanguageContext";

interface HomeStrings {
  tagline: string;
  creatorCodePrefix: string;
  liveStatusTitle: string;
  liveStatusSub: string;
  online: string;
  offline: string;
  botsOnline: string;
  totalFriends: string;
  avgPing: string;
  noBots: string;
  friends: string;
  viewCommands: string;
  connected: string;
  disconnected: string;
}

export const homeTranslations: Record<Language, HomeStrings> = {
  en: {
    tagline: "Fortnite lobby bots, live status and community commands.",
    creatorCodePrefix: "Support us with creator code",
    liveStatusTitle: "Live bot status",
    liveStatusSub: "Read-only — updated in real time.",
    online: "Online",
    offline: "Offline",
    botsOnline: "bots online",
    totalFriends: "total friends",
    avgPing: "avg ping",
    noBots: "No bots connected right now.",
    friends: "friends",
    viewCommands: "View commands",
    connected: "Connected to the live feed",
    disconnected: "Disconnected — reconnecting...",
  },
  fr: {
    tagline: "Bots de lobby Fortnite, statut en direct et commandes communautaires.",
    creatorCodePrefix: "Soutiens-nous avec le code créateur",
    liveStatusTitle: "Statut des bots en direct",
    liveStatusSub: "Lecture seule — mis à jour en temps réel.",
    online: "En ligne",
    offline: "Hors ligne",
    botsOnline: "bots en ligne",
    totalFriends: "amis au total",
    avgPing: "ping moyen",
    noBots: "Aucun bot connecté pour le moment.",
    friends: "amis",
    viewCommands: "Voir les commandes",
    connected: "Connecté au flux en direct",
    disconnected: "Déconnecté — reconnexion en cours...",
  },
  es: {
    tagline: "Bots de lobby de Fortnite, estado en vivo y comandos de la comunidad.",
    creatorCodePrefix: "Apóyanos con el código de creador",
    liveStatusTitle: "Estado de los bots en vivo",
    liveStatusSub: "Solo lectura — actualizado en tiempo real.",
    online: "En línea",
    offline: "Desconectado",
    botsOnline: "bots en línea",
    totalFriends: "amigos en total",
    avgPing: "ping medio",
    noBots: "No hay bots conectados en este momento.",
    friends: "amigos",
    viewCommands: "Ver comandos",
    connected: "Conectado al flujo en vivo",
    disconnected: "Desconectado — reconectando...",
  },
  de: {
    tagline: "Fortnite-Lobby-Bots, Live-Status und Community-Befehle.",
    creatorCodePrefix: "Unterstütze uns mit dem Creator-Code",
    liveStatusTitle: "Live-Bot-Status",
    liveStatusSub: "Nur lesend — in Echtzeit aktualisiert.",
    online: "Online",
    offline: "Offline",
    botsOnline: "Bots online",
    totalFriends: "Freunde insgesamt",
    avgPing: "Ø Ping",
    noBots: "Aktuell sind keine Bots verbunden.",
    friends: "Freunde",
    viewCommands: "Befehle ansehen",
    connected: "Mit dem Live-Feed verbunden",
    disconnected: "Getrennt — Wiederverbindung läuft...",
  },
};
