import type { Language } from "@/i18n/LanguageContext";

export interface CommandsStrings {
  title: string;
  searchPlaceholder: string;
  intro: string;
  secCosmetics: string;
  secCosmeticsSub: string;
  secLobby: string;
  secLobbySub: string;
  secDiscord: string;
  secDiscordSub: string;
  secPremium: string;
  secPremiumSub: string;
  ctaTitle: string;
  ctaText: string;
  ctaBtn: string;
  adminBadge: string;
  premiumBadge: string;
  noResults: string;
}

export const commandsTranslations: Record<Language, CommandsStrings> = {
  en: {
    title: "📖 LobbyBot Commands",
    searchPlaceholder: "Search a command...",
    intro: 'In-game commands are used <b>directly in Fortnite</b>: in the <b>lobby chat</b> (with a bot in your party) or by <b>private message</b> to a bot on Epic Games. Cosmetic names are <b>typo-tolerant</b> and understand styles: <code>!skin ghoul rose</code>, <code>!skin drift 4</code>. Discord commands are used on our Discord server.',
    secCosmetics: "👗 In-Game — Cosmetics",
    secCosmeticsSub: "Type these in the Fortnite lobby chat or DM the bot.",
    secLobby: "🎮 In-Game — Lobby",
    secLobbySub: "Party controls, ready state, screenshots tricks.",
    secDiscord: "💬 Discord",
    secDiscordSub: "Slash commands on the LobbyBot Discord server.",
    secPremium: "💎 Premium",
    secPremiumSub: "Your own personal bot fleet — exclusive commands.",
    ctaTitle: "💎 LobbyBot Premium",
    ctaText: "Get your OWN personal bots: they join your party as a full squad, dance in sync, apply your saved loadouts in one command — and you support the project. Subscribe directly on Discord with /premium.",
    ctaBtn: "Get Premium on Discord",
    adminBadge: "admin",
    premiumBadge: "💎 premium",
    noResults: "No command matches your search.",
  },
  fr: {
    title: "📖 Commandes LobbyBot",
    searchPlaceholder: "Rechercher une commande...",
    intro: "Les commandes in-game s'utilisent <b>directement dans Fortnite</b> : dans le <b>chat du lobby</b> (avec un bot dans ton groupe) ou en <b>message privé</b> à un bot sur Epic Games. Les noms de cosmétiques <b>tolèrent les fautes</b> et comprennent les styles : <code>!skin ghoul rose</code>, <code>!skin drift 4</code>. Les commandes Discord s'utilisent sur notre serveur Discord.",
    secCosmetics: "👗 In-Game — Cosmétiques",
    secCosmeticsSub: "À taper dans le chat du lobby Fortnite ou en MP au bot.",
    secLobby: "🎮 In-Game — Lobby",
    secLobbySub: "Contrôles du groupe, ready, astuces screenshots.",
    secDiscord: "💬 Discord",
    secDiscordSub: "Commandes slash sur le serveur Discord LobbyBot.",
    secPremium: "💎 Premium",
    secPremiumSub: "Ta propre flotte de bots perso — commandes exclusives.",
    ctaTitle: "💎 LobbyBot Premium",
    ctaText: "Obtiens TES propres bots perso : ils rejoignent ton groupe en squad complète, dansent en synchro, appliquent tes loadouts sauvegardés en une commande — et tu soutiens le projet. Abonne-toi directement sur Discord avec /premium.",
    ctaBtn: "Passer Premium sur Discord",
    adminBadge: "admin",
    premiumBadge: "💎 premium",
    noResults: "Aucune commande ne correspond à ta recherche.",
  },
  es: {
    title: "📖 Comandos LobbyBot",
    searchPlaceholder: "Buscar un comando...",
    intro: "Los comandos in-game se usan <b>directamente en Fortnite</b>: en el <b>chat del lobby</b> (con un bot en tu grupo) o por <b>mensaje privado</b> a un bot en Epic Games. Los nombres de cosméticos <b>toleran errores</b> y entienden estilos: <code>!skin ghoul rosa</code>, <code>!skin drift 4</code>. Los comandos de Discord se usan en nuestro servidor.",
    secCosmetics: "👗 In-Game — Cosméticos",
    secCosmeticsSub: "Escríbelos en el chat del lobby de Fortnite o por MP al bot.",
    secLobby: "🎮 In-Game — Lobby",
    secLobbySub: "Controles del grupo, ready, trucos para capturas.",
    secDiscord: "💬 Discord",
    secDiscordSub: "Comandos slash en el servidor de Discord de LobbyBot.",
    secPremium: "💎 Premium",
    secPremiumSub: "Tu propia flota de bots personales — comandos exclusivos.",
    ctaTitle: "💎 LobbyBot Premium",
    ctaText: "Consigue TUS propios bots personales: se unen a tu grupo como un squad completo, bailan en sincronía, aplican tus loadouts guardados en un comando — y apoyas el proyecto. Suscríbete en Discord con /premium.",
    ctaBtn: "Conseguir Premium en Discord",
    adminBadge: "admin",
    premiumBadge: "💎 premium",
    noResults: "Ningún comando coincide con tu búsqueda.",
  },
  de: {
    title: "📖 LobbyBot Befehle",
    searchPlaceholder: "Befehl suchen...",
    intro: "In-Game-Befehle werden <b>direkt in Fortnite</b> verwendet: im <b>Lobby-Chat</b> (mit einem Bot in deiner Party) oder per <b>Privatnachricht</b> an einen Bot auf Epic Games. Cosmetic-Namen sind <b>tippfehlertolerant</b> und verstehen Stile: <code>!skin ghoul rosa</code>, <code>!skin drift 4</code>. Discord-Befehle nutzt du auf unserem Discord-Server.",
    secCosmetics: "👗 In-Game — Kosmetik",
    secCosmeticsSub: "Im Fortnite-Lobby-Chat eingeben oder dem Bot per DM schicken.",
    secLobby: "🎮 In-Game — Lobby",
    secLobbySub: "Party-Steuerung, Ready-Status, Screenshot-Tricks.",
    secDiscord: "💬 Discord",
    secDiscordSub: "Slash-Befehle auf dem LobbyBot Discord-Server.",
    secPremium: "💎 Premium",
    secPremiumSub: "Deine eigene persönliche Bot-Flotte — exklusive Befehle.",
    ctaTitle: "💎 LobbyBot Premium",
    ctaText: "Hol dir DEINE eigenen Bots: Sie joinen deiner Party als komplettes Squad, tanzen synchron, wenden gespeicherte Loadouts mit einem Befehl an — und du unterstützt das Projekt. Abonniere direkt auf Discord mit /premium.",
    ctaBtn: "Premium auf Discord holen",
    adminBadge: "admin",
    premiumBadge: "💎 premium",
    noResults: "Kein Befehl passt zu deiner Suche.",
  },
};
