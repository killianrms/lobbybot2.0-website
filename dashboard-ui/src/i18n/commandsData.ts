export interface CommandDesc {
  en: string;
  fr: string;
  es: string;
  de: string;
}

export interface CommandEntry {
  name: string;
  aliases: string[];
  admin?: boolean;
  premium?: boolean;
  desc: CommandDesc;
}

export interface CommandCategory {
  key: "cosmetics" | "lobby" | "discord" | "premium";
  commands: CommandEntry[];
}

// desc: {en, fr, es, de} — admin: true → red badge — premium: true → gold card
export const COMMAND_CATEGORIES: CommandCategory[] = [
  {
    key: "cosmetics",
    commands: [
      {
        name: "!skin <n>",
        aliases: ["!outfit"],
        desc: {
          en: "Changes the bot's skin. Typos OK, styles inline: <code>!skin ghoul rose</code>, <code>!skin purple skull</code>, <code>!skin drift 4</code>.",
          fr: "Change le skin du bot. Fautes OK, styles direct : <code>!skin ghoul rose</code>, <code>!skin skull violet</code>, <code>!skin drift 4</code>.",
          es: "Cambia el skin del bot. Errores OK, estilos directos: <code>!skin ghoul rosa</code>, <code>!skin skull morado</code>, <code>!skin drift 4</code>.",
          de: "Ändert den Skin des Bots. Tippfehler OK, Stile direkt: <code>!skin ghoul rosa</code>, <code>!skin skull lila</code>, <code>!skin drift 4</code>.",
        },
      },
      {
        name: "!style <style>",
        aliases: ["!variant"],
        desc: {
          en: "Applies a style to the current skin: <code>!style pink</code>, <code>!style gold</code>, <code>!style stage 3</code>.",
          fr: "Applique un style au skin actuel : <code>!style rose</code>, <code>!style gold</code>, <code>!style stage 3</code>.",
          es: "Aplica un estilo al skin actual: <code>!style rosa</code>, <code>!style gold</code>, <code>!style stage 3</code>.",
          de: "Wendet einen Stil auf den aktuellen Skin an: <code>!style rosa</code>, <code>!style gold</code>, <code>!style stage 3</code>.",
        },
      },
      {
        name: "!pinkghoul / !purpleskull",
        aliases: [],
        desc: {
          en: "Instant shortcuts for the two most requested OG skins.",
          fr: "Raccourcis instantanés pour les deux skins OG les plus demandés.",
          es: "Atajos instantáneos para los dos skins OG más pedidos.",
          de: "Sofort-Shortcuts für die zwei meistgefragten OG-Skins.",
        },
      },
      {
        name: "!backpack <name|none>",
        aliases: ["!bag", "!sac"],
        desc: {
          en: "Sets the back bling — <code>none</code> removes it.",
          fr: "Change le sac à dos — <code>none</code> pour le retirer.",
          es: "Cambia la mochila — <code>none</code> para quitarla.",
          de: "Ändert den Rucksack — <code>none</code> zum Entfernen.",
        },
      },
      {
        name: "!pickaxe <n>",
        aliases: ["!pioche"],
        desc: { en: "Sets the pickaxe.", fr: "Change la pioche.", es: "Cambia el pico.", de: "Ändert die Spitzhacke." },
      },
      {
        name: "!glider <n>",
        aliases: ["!planeur"],
        desc: { en: "Sets the glider.", fr: "Change le planeur.", es: "Cambia el ala delta.", de: "Ändert den Gleiter." },
      },
      {
        name: "!shoes <name|none>",
        aliases: ["!kicks"],
        desc: { en: "Sets the shoes.", fr: "Change les chaussures.", es: "Cambia los zapatos.", de: "Ändert die Schuhe." },
      },
      {
        name: "!emote <n>",
        aliases: ["!dance", "!danse"],
        desc: {
          en: "Makes the bot dance. <code>!stopdanse</code> stops it.",
          fr: "Fait danser le bot. <code>!stopdanse</code> pour arrêter.",
          es: "Hace bailar al bot. <code>!stopdanse</code> para parar.",
          de: "Lässt den Bot tanzen. <code>!stopdanse</code> zum Stoppen.",
        },
      },
      {
        name: "!copy [player]",
        aliases: ["!copie", "!stopcopy"],
        desc: {
          en: "Copies a player's FULL loadout — skin, styles <b>and dances, live</b>. No argument = copies you.",
          fr: "Copie TOUT le loadout d'un joueur — skin, styles <b>et danses, en direct</b>. Sans argument = te copie toi.",
          es: "Copia TODO el loadout de un jugador — skin, estilos <b>y bailes, en directo</b>. Sin argumento = te copia.",
          de: "Kopiert das GANZE Loadout eines Spielers — Skin, Stile <b>und Tänze, live</b>. Ohne Argument = kopiert dich.",
        },
      },
      {
        name: "!new [skins|emotes]",
        aliases: ["!stop"],
        desc: {
          en: "Showcase of the newest items from the latest update — often not even released yet! One every 6s, <code>!stop</code> to end.",
          fr: "Défilé des nouveautés de la dernière MAJ — souvent même pas encore sorties ! Une toutes les 6s, <code>!stop</code> pour arrêter.",
          es: "Desfile de las novedades de la última actualización — ¡a menudo sin salir aún! Una cada 6s, <code>!stop</code> para terminar.",
          de: "Schau der neuesten Items des letzten Updates — oft noch unveröffentlicht! Eins alle 6s, <code>!stop</code> zum Beenden.",
        },
      },
      {
        name: "!random [skin|emote]",
        aliases: ["!rdm"],
        desc: { en: "Random cosmetic.", fr: "Cosmétique aléatoire.", es: "Cosmético aleatorio.", de: "Zufälliges Cosmetic." },
      },
      {
        name: "!level <n>",
        aliases: ["!niveau"],
        desc: { en: "Sets the bot's displayed level.", fr: "Change le niveau affiché du bot.", es: "Cambia el nivel mostrado.", de: "Ändert das angezeigte Level." },
      },
    ],
  },
  {
    key: "lobby",
    commands: [
      {
        name: "!hide [me] / !show",
        aliases: ["!unhide"],
        desc: {
          en: "Hides everyone except the bot — perfect for rare skin screenshots 😏 Bot must be party leader.",
          fr: "Cache tout le monde sauf le bot — parfait pour les screens de skins rares 😏 Le bot doit être chef.",
          es: "Oculta a todos excepto el bot — perfecto para capturas de skins raros 😏 El bot debe ser líder.",
          de: "Versteckt alle außer dem Bot — perfekt für Screenshots seltener Skins 😏 Bot muss Leader sein.",
        },
      },
      {
        name: "!ready / !unready",
        aliases: ["!pret", "!paspret"],
        desc: { en: "Ready / Not ready.", fr: "Prêt / Pas prêt.", es: "Listo / No listo.", de: "Bereit / Nicht bereit." },
      },
      {
        name: "!sitout / !sitin",
        aliases: [],
        desc: {
          en: "The bot sits out of the match / participates again.",
          fr: "Le bot ne participe plus à la partie / participe de nouveau.",
          es: "El bot deja de participar / participa de nuevo.",
          de: "Der Bot setzt aus / nimmt wieder teil.",
        },
      },
      {
        name: "!invite [player]",
        aliases: [],
        desc: {
          en: "The bot invites you (or a friend) to its party.",
          fr: "Le bot t'invite (ou un ami) dans son groupe.",
          es: "El bot te invita (o a un amigo) a su grupo.",
          de: "Der Bot lädt dich (oder einen Freund) ein.",
        },
      },
      {
        name: "!partyinfo / !fc",
        aliases: ["!party", "!friendcount"],
        desc: {
          en: "Party members / bot friend count.",
          fr: "Membres du groupe / nombre d'amis du bot.",
          es: "Miembros del grupo / número de amigos.",
          de: "Party-Mitglieder / Freundesanzahl.",
        },
      },
      {
        name: "!kick / !promote / !privacy / !leave / !add",
        aliases: [],
        admin: true,
        desc: {
          en: "Kick, promote, party privacy, leave, friend request.",
          fr: "Exclure, promouvoir, confidentialité, quitter, demande d'ami.",
          es: "Expulsar, promover, privacidad, salir, solicitud de amistad.",
          de: "Kicken, befördern, Privatsphäre, verlassen, Freundschaftsanfrage.",
        },
      },
      {
        name: "!help / !ping",
        aliases: ["!aide"],
        desc: {
          en: "Command list in the Fortnite chat / response test.",
          fr: "Liste des commandes dans le chat Fortnite / test de réponse.",
          es: "Lista de comandos en el chat / prueba de respuesta.",
          de: "Befehlsliste im Chat / Antworttest.",
        },
      },
    ],
  },
  {
    key: "discord",
    commands: [
      {
        name: "/login · /logout",
        aliases: [],
        desc: {
          en: "Link / unlink your Epic Games account (1-click).",
          fr: "Connecte / déconnecte ton compte Epic Games (1 clic).",
          es: "Vincula / desvincula tu cuenta Epic Games (1 clic).",
          de: "Verknüpft / trennt dein Epic Games Konto (1 Klick).",
        },
      },
      {
        name: "/add [pseudo]",
        aliases: [],
        desc: {
          en: "A bot sends you a friend request (auto if logged in).",
          fr: "Un bot t'envoie une demande d'ami (auto si connecté).",
          es: "Un bot te envía una solicitud de amistad.",
          de: "Ein Bot sendet dir eine Freundschaftsanfrage.",
        },
      },
      {
        name: "/skin <bot> <n>",
        aliases: [],
        desc: {
          en: "Makes one of your friended bots wear a skin.",
          fr: "Fait porter un skin à un de tes bots amis.",
          es: "Hace que uno de tus bots amigos use un skin.",
          de: "Lässt einen deiner Bot-Freunde einen Skin tragen.",
        },
      },
      {
        name: "/invite [bot]",
        aliases: [],
        desc: {
          en: "A bot invites you to its Fortnite party.",
          fr: "Un bot t'invite dans son groupe Fortnite.",
          es: "Un bot te invita a su grupo.",
          de: "Ein Bot lädt dich in seine Party ein.",
        },
      },
      {
        name: "/listbots · /info · /status",
        aliases: [],
        desc: {
          en: "Available bots / global stats / Fortnite services status.",
          fr: "Bots disponibles / stats globales / état des services Fortnite.",
          es: "Bots disponibles / estadísticas / estado de los servicios.",
          de: "Verfügbare Bots / Statistiken / Dienststatus.",
        },
      },
      {
        name: "/shop · /map · /news",
        aliases: [],
        desc: {
          en: "Item shop / current map / Fortnite news.",
          fr: "Boutique du jour / carte actuelle / actus Fortnite.",
          es: "Tienda / mapa actual / noticias.",
          de: "Shop / aktuelle Karte / News.",
        },
      },
      {
        name: "/locker · /list",
        aliases: [],
        desc: {
          en: "Your Fortnite locker / your Epic friends list. Requires /login.",
          fr: "Ton casier Fortnite / ta liste d'amis Epic. Nécessite /login.",
          es: "Tu taquilla / tu lista de amigos. Requiere /login.",
          de: "Dein Locker / deine Freundesliste. Benötigt /login.",
        },
      },
      {
        name: "/sac [code]",
        aliases: [],
        desc: {
          en: "Sets your Support-A-Creator code (default: <b>aeroz</b> 💙).",
          fr: "Définit ton code créateur (défaut : <b>aeroz</b> 💙).",
          es: "Define tu código de creador (por defecto: <b>aeroz</b> 💙).",
          de: "Setzt deinen Creator-Code (Standard: <b>aeroz</b> 💙).",
        },
      },
      {
        name: "/setlangage <lang>",
        aliases: [],
        desc: {
          en: "Reply language: EN (default), FR, ES, DE.",
          fr: "Langue des réponses : EN (défaut), FR, ES, DE.",
          es: "Idioma de las respuestas: EN (defecto), FR, ES, DE.",
          de: "Antwortsprache: EN (Standard), FR, ES, DE.",
        },
      },
      {
        name: "/commands",
        aliases: [],
        desc: {
          en: "This list, inside Discord.",
          fr: "Cette liste, directement dans Discord.",
          es: "Esta lista, dentro de Discord.",
          de: "Diese Liste, direkt in Discord.",
        },
      },
    ],
  },
  {
    key: "premium",
    commands: [
      {
        name: "/premium",
        aliases: [],
        premium: true,
        desc: {
          en: "Discover LobbyBot Premium, check your subscription, subscribe in 2 clicks.",
          fr: "Découvre LobbyBot Premium, consulte ton abonnement, abonne-toi en 2 clics.",
          es: "Descubre LobbyBot Premium y suscríbete en 2 clics.",
          de: "Entdecke LobbyBot Premium und abonniere in 2 Klicks.",
        },
      },
      {
        name: "/squad",
        aliases: [],
        premium: true,
        desc: {
          en: "Your personal bots join your party — a full squad just for you, 24/7.",
          fr: "Tes bots perso rejoignent ton groupe — une squad complète rien que pour toi, 24/7.",
          es: "Tus bots personales se unen a tu grupo — un squad completo solo para ti.",
          de: "Deine persönlichen Bots joinen deiner Party — ein ganzes Squad nur für dich.",
        },
      },
      {
        name: "/emote-all <n>",
        aliases: [],
        premium: true,
        desc: {
          en: "All your bots dance the same emote at once — perfect for TikTok/YouTube.",
          fr: "Tous tes bots dansent la même emote en même temps — parfait pour TikTok/YouTube.",
          es: "Todos tus bots bailan la misma emote a la vez — perfecto para TikTok/YouTube.",
          de: "Alle deine Bots tanzen dieselbe Emote gleichzeitig — perfekt für TikTok/YouTube.",
        },
      },
      {
        name: "/preset save|apply|list",
        aliases: [],
        premium: true,
        desc: {
          en: "Save full loadouts and apply them to your whole fleet in one command.",
          fr: "Sauvegarde des loadouts complets et applique-les à toute ta flotte en une commande.",
          es: "Guarda loadouts completos y aplícalos a toda tu flota en un comando.",
          de: "Speichere komplette Loadouts und wende sie auf deine ganze Flotte an.",
        },
      },
    ],
  },
];
