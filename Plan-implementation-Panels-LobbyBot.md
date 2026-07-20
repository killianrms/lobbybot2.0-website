# Plan d'implémentation — Panels LobbyBot 2.0 (shadcn/ui)

**Référence :** Cahier-des-charges-Panels-LobbyBot.md
**Objectif :** implémenter en local, valider, puis push sur le repo d'Aeroz.

Cocher au fur et à mesure. Chaque phase a un "critère de fin" à valider avant de passer à la suivante.

---

## Phase 0 — Cadrage
- [x] Contenu réel du panel premium confirmé — pas à inventer : déjà implémenté côté bot Discord (`/squad`, `/emote-all`, `/preset save|apply|list`, quota de bots 1 gratuit/3 premium via `PREMIUM_BOT_QUOTA`). Le panel web premium doit exposer ces mêmes fonctionnalités via une UI, pas en créer de nouvelles.
- [x] Mode d'attribution du statut premium confirmé — abonnement natif Discord (App Subscription / SKU), stocké dans la table partagée `premium` (`discord_id`, `source`, `granted_at`, `expires_at`). Le login du panel premium se fera donc via **Discord OAuth2** (et non email/mot de passe) pour aller lire le vrai statut/les vraies données du même `discord_id` que le bot utilise déjà — voir note d'architecture en Phase 5.
- [x] Solution VPN retenue confirmée — **Option C** (cf. section 5 du cahier des charges) : tunnel Cloudflare public pour `/` et `/premium`, `/admin` jamais exposé via ce tunnel, accessible uniquement via un tunnel/VPN séparé.
- [x] Hébergement final confirmé — un **VPS** est prévu comme destination finale (pas de date précisée). En attendant, PC local + tunnel Cloudflare. Aucune action de code nécessaire pour ce changement en soi (rien dans le code ne suppose un hébergement particulier), mais à garder en tête pour la Phase 7 : le VPS n'a pas encore de Node/pnpm/dépendances installées, ce sera à prévoir dans la checklist de déploiement.

*Ne bloque pas les phases 1 à 3, qui sont communes à tous les scénarios.*

---

## Phase 1 — Setup technique local
- [x] Backend Express opérationnel (`pnpm install`)
- [x] Fix `ERR_PNPM_IGNORED_BUILDS` sur `better-sqlite3` (`pnpm approve-builds` + `pnpm rebuild better-sqlite3`)
- [x] Scaffold Vite + React + TypeScript (`dashboard-ui/`)
- [x] Tailwind CSS configuré
- [x] shadcn/ui initialisé + composants de base ajoutés (button, card, input, label, dialog, table, badge, sonner, tabs) — CLI shadcn indisponible dans le sandbox (registre bloqué), composants recréés à la main sur la base des sources officielles, `components.json` en place pour les futurs ajouts via `pnpm dlx shadcn add`
- [x] Proxy Vite → Express (`/api`, `/socket.io`) fonctionnel — déjà présent dans `vite.config.ts`
- [x] Routing des 3 URLs en place (`/`, `/premium`, `/admin`), même avec des pages vides — layouts + pages placeholder créés, alias `@/*` configuré

**Critère de fin de phase :** `pnpm dev` affiche les 3 routes, connectées au socket du backend existant.
> ⚠️ À vérifier en local : la connexion effective au socket du backend Express n'a pas pu être testée dans ce sandbox (pas de test bout-en-bout avec `server.js` lancé). Structure et build validés (`tsc -b`, `vite build`, `oxlint` OK).

---

## Phase 2 — Système de rôles (backend)
- [x] Colonne `role` ajoutée à `dashboard_admins` (migration SQLite) — migration idempotente via `PRAGMA table_info` + `ALTER TABLE ADD COLUMN`, comptes existants basculés sur `'admin'` par défaut (pas de casse rétrocompatible)
- [x] Middlewares `requireRole('admin')` / `requireRole('premium')` créés — `requireAdmin` et `requirePremium` exportés en pratique via `requireRole(...)`, un compte `admin` passe aussi les routes `premium` (hiérarchie: admin ⊇ premium)
- [x] `/api/auth/login` retourne le rôle dans la session — `req.session.role`, exposé aussi par `/api/auth/me`
- [x] Handshake Socket.io propage `socket.role` — dérivé de la session HTTP partagée (`io.engine.use(sessionMiddleware)`), avec `socket.isAdmin` / `socket.isPremium` dérivés

**Critère de fin de phase :** un compte admin test + un compte premium test, permissions vérifiables sur une route protégée.
> ✅ Testé de bout en bout dans le sandbox (comptes de seed `ADMIN_SEED_*` / `PREMIUM_SEED_*`) :
> - Login admin → `role: "admin"`, accès `/api/admin/users` (200) et `/api/premium/whoami` (200, hérite premium)
> - Login premium → `role: "premium"`, accès `/api/premium/whoami` (200), refusé sur `/api/admin/users` (403)
> - Sans session → 401 sur les deux
> - Socket.io : un client connecté avec le cookie de session admin peut émettre `cmd:manager:action` (accepté) ; avec le cookie premium, la commande est rejetée (`[Security] Rejected ... unauthenticated socket` — comportement attendu, seul un admin pilote la flotte)
> - Route `/api/premium/whoami` ajoutée comme scaffold de test ; à remplacer par le vrai contenu du panel premium en Phase 5
> - `.env.example` créé/mis à jour avec `PREMIUM_SEED_EMAIL` / `PREMIUM_SEED_PASSWORD`

---

## Phase 3 — Migration du panel admin vers shadcn
- [x] Écran de login (Card, Input, Button) — `LoginCard.tsx`
- [x] Vue flotte de bots (Table + Badge statut) — `FleetTable.tsx`, colonnes nom/statut/amis/ping
- [x] Actions sur les bots (kick, skin, restart...) avec confirmation (Dialog) — `CommandDialog.tsx` (toutes les actions de `BotManager.executeAction` côté manager Discord : skin/backpack/pickaxe/emote/kick/promote/privacy/ready/leave/hide/show/level), restart/suppression via `AlertDialog`
- [x] Gestion des comptes admin (Table + Dialog + Form) — `AccountsTable.tsx` + `CreateAccountDialog.tsx`, avec sélection du rôle (admin/premium)
- [x] Configuration globale (Form + Textarea) — `ConfigForm.tsx`
- [x] Flux d'activité temps réel + toasts (sonner) — `ActivityFeed.tsx`, toast à chaque `activity:new`

**Critère de fin de phase :** parité fonctionnelle avec l'ancien `admin.html`, ancien panel toujours dispo en fallback.
> ✅ Parité dépassée : l'ancien `admin.html`/`admin.js` n'implémentait en réalité que login + config + liste de bots en lecture seule (pas de gestion des comptes, pas de flux d'activité, pas d'actions bot dans l'UI bien que les routes existaient côté serveur). Le nouveau panel React couvre tout le périmètre de la section 6.3 du cahier des charges.
> ✅ Testé de bout en bout dans le sandbox : proxy Vite → Express (login, ajout de bot, `/api/bots`, `/api/admin/users`, handshake Socket.io) — tout passe correctement à travers `pnpm dev` comme le ferait un vrai navigateur.
> ⚠️ Ancien panel (`public/admin.html`) conservé tel quel en fallback (non touché), toujours accessible directement.
> ⚠️ Non testé : rendu réel dans un navigateur (le sandbox n'a pas de navigateur graphique) — build (`tsc -b`, `vite build`) et proxy HTTP/Socket.io validés, mais à confirmer visuellement chez toi.
> Composants shadcn ajoutés en plus de la Phase 1 : `textarea`, `select`, `alert-dialog`.

---

## Phase 4 — Panel public
- [x] Page d'accueil (reprise `index.html`) — reconstruite en vitrine + statut live lecture seule (voir note ci-dessous sur le changement de comportement)
- [x] Statut live des bots en lecture seule — `usePublicBots.ts` (Socket.io, sans authentification), compteurs (bots en ligne, amis total, ping moyen) + liste des bots
- [x] Page commandes (reprise `commands.html`) — toutes les commandes portées (cosmetics/lobby/discord/premium), recherche, badges admin/premium, CTA Premium
- [x] Liens CGU / confidentialité — contenu réel porté (français, comme l'original), pages `Terms.tsx`/`Privacy.tsx`

**Critère de fin de phase :** accessible sans login, aucune action de pilotage exposée.
> ⚠️ **Changement de comportement important** : l'ancien `index.html` exposait en fait un panneau de pilotage complet (kick/promote/skin/emote/etc.) accessible sans authentification. Ces actions étaient déjà rejetées côté serveur pour un visiteur non-admin (`socket.isAdmin` requis sur `cmd:manager:action`), donc pas de faille de sécurité active, mais l'UI donnait l'illusion que ça fonctionnait. Conforme à la section 6.1 du cahier des charges ("Aucune action de pilotage possible"), toute cette UI de pilotage a été retirée du nouveau panel public — elle n'existe désormais que dans le panel admin (Phase 3) et sera reprise sous forme limitée dans le panel premium (Phase 5, "configuration limitée de son propre bot").
> ✅ Support multilingue conservé (EN/FR/ES/DE) sur Accueil + Commandes, comme demandé — même clé `localStorage` (`dashboard_lang`) que l'ancien site pour ne pas perdre la préférence des visiteurs existants.
> ✅ `tsc -b`, `pnpm run build`, `oxlint` : tous OK (0 erreur).
> ⚠️ Non testé : rendu visuel réel dans un navigateur (sandbox sans navigateur graphique) — à confirmer chez toi comme pour la Phase 3.

---

## Phase 5 — Panel premium
*Débloquée : décisions prises en Phase 0 (voir ci-dessus).*

**Architecture retenue** (suite à la découverte du système premium existant côté bot Discord) :
- Auth : Discord OAuth2 (nouveau flux, distinct du login email/mot de passe admin) — le panel premium doit connaître le `discord_id` du visiteur pour interroger les mêmes tables que le bot (`premium`, `epic_accounts.owner_discord_id`, `loadout_presets`).
- Backend : nouvelles routes `/api/auth/discord/*` (redirect + callback OAuth2), nouvelle session premium (`req.session.discordId`), middleware de vérification du statut premium en lisant directement la table `premium` partagée (pas de nouveau rôle `dashboard_admins`, le rôle `premium` de la Phase 2 reste utile pour le panel *admin* mais n'est pas le mécanisme du panel premium public).
- Écrans envisagés : statut d'abonnement (actif/expiré, source), flotte perso (bots liés via `owner_discord_id`), gestion des presets (`loadout_presets` : save/apply/list), déclenchement squad/emote-all depuis le web (au choix : via Socket.io vers le bot, ou nouvelle route dédiée).
- [x] Écrans développés selon l'architecture ci-dessus — `Premium.tsx` (3 états : déconnecté / connecté-non-premium / premium complet), `useDiscordAuth`, `usePremiumData`
- [ ] App Discord OAuth2 configurée (client ID/secret, redirect URI) — nécessite un accès au Discord Developer Portal du bot, **à faire par toi**

**Ce qui a été construit :**
> - **Website (`server.js`)** : tables partagées `premium`/`users`/`loadout_presets` créées de façon idempotente + migration `owner_discord_id` sur `epic_accounts` (fonctionne peu importe quel process démarre en premier). Routes OAuth2 (`/api/auth/discord/login|callback|logout|me`) et routes premium (`/api/premium/bots`, `/presets` GET/POST activate/DELETE, `/squad`, `/emote-all`).
> - **Pont temps réel vers le bot** : `POST /api/premium/squad` et `/emote-all` ciblent précisément la socket du manager Discord connecté (jamais de broadcast — ce sont des actions privées d'un utilisateur) via un acquittement Socket.io (`socket.timeout(...).emit(event, data, callback)`).
> - **Bot Discord (`SocketManager.ts`)** : nouveaux listeners `premium:squad` / `premium:emoteAll`, réutilisant exactement la logique de `SquadCommand`/`EmoteAllCommand` existantes (aucune duplication de règles métier, juste un nouveau point d'entrée). `dbManager` injecté dans `SocketManager` (untouché avant).
> - **Frontend** : `useDiscordAuth` (contexte OAuth2 séparé de l'auth admin), `usePremiumData` (bots/presets/actions), page Premium avec upsell si non-abonné, flotte perso en lecture seule, gestion des presets (activer/supprimer), déclenchement Squad et Emote synchronisée.

> ✅ Testé dans le sandbox : migrations/création de tables au démarrage (aucune erreur), toutes les routes `/api/premium/*` (bots, presets, activate, delete) avec un contournement de session de test, et le pont Socket.io squad/emote-all avec un faux manager simulé répondant par acquittement — tout le trajet aller-retour fonctionne.
> ✅ `tsc -b`/`tsc --noEmit`, `pnpm run build`/`npm run build`, `oxlint` : tous OK (0 erreur) sur les deux repos.
> ⚠️ **Non testable dans ce sandbox** : le vrai flux OAuth2 Discord (nécessite un Client ID/Secret réel + un utilisateur Discord consentant dans un navigateur). À tester chez toi une fois l'appli OAuth2 configurée sur le Developer Portal.
> ⚠️ Limitation connue : la création d'un nouveau preset (`/preset save`) n'est pas exposée côté web pour l'instant — elle nécessite la résolution de noms de cosmétiques via le `FortniteAPIService` du bot (recherche floue), pas encore branchée. Le web ne fait qu'activer/lister/supprimer des presets déjà créés via Discord. À ajouter si besoin dans un futur pass.
> ✅ Ajout suite à une remarque : nouvel onglet **Premium** dans le panel admin (`PremiumGrantsTable` + `GrantPremiumDialog`) pour accorder/retirer le premium manuellement à un `discord_id` (toi y compris) — réutilise le champ `source: 'manual'` déjà prévu dans la table `premium`, sans mélanger le système d'auth admin (email/mot de passe) avec celui du panel premium (Discord OAuth2). Testé de bout en bout : validation de l'ID Discord, attribution, listing, révocation, protection par `requireAdmin`.
> ✅ Ajout suite à une 2e remarque : nouvelle table `web_discord_users` (propre au website, distincte de la table `users` du bot qui sert au `/login` Epic) — chaque connexion Discord OAuth2 sur le site est maintenant enregistrée (discord_id, pseudo, première/dernière connexion), même sans premium. Nouvel onglet **Utilisateurs** dans le panel admin (`WebUsersTable`) pour les lister, avec statut premium et pseudo Epic (si lié) en contexte. Testé de bout en bout.

---

## Phase 6 — Restriction VPN
*Débloquée : Option C retenue en Phase 0.*
- [x] Configuration selon l'option retenue (tunnel séparé pour `/admin`, non exposé via le tunnel public) — voir `deploy/cloudflared/README.md`, `config-public.yml`, `config-admin.yml`
- [ ] Test : `/admin` inaccessible hors VPN, `/` et `/premium` restent accessibles — **à faire par toi**, nécessite ton compte Cloudflare

> **Ce qui a été livré :**
> - Guide pas-à-pas complet (`deploy/cloudflared/README.md`) : création des 2 tunnels Cloudflare séparés, enregistrements DNS, config Cloudflare Access sur le tunnel admin, lancement, et check-list de test — rien de tout ça n'est exécutable depuis mon environnement (accès à ton compte Cloudflare requis), donc c'est une doc + des templates de config à suivre.
> - Templates `config-public.yml` (bloque explicitement `/admin*` avec un 404, même sur le tunnel public) et `config-admin.yml` (tunnel séparé, à protéger par Cloudflare Access).
> - **Défense en profondeur côté appli** (`server.js`) : nouveau middleware `ADMIN_HOSTNAME` — si configuré, toute requête vers `/admin`, `/api/admin/*`, `/api/bots/*` est refusée (404) si elle n'arrive pas par le hostname admin exact. No-op tant que la variable n'est pas définie (aucun impact en dev local).
> ✅ Testé dans le sandbox : requête sur `/api/admin/users` avec `Host: localhost` → 404 ; même requête avec `Host: admin.internal.test` → 401 (comportement normal, juste pas authentifié) ; route publique (`/api/health`) fonctionne quel que soit le host.
> ⚠️ La partie Cloudflare elle-même (tunnels, DNS, Access) doit être faite par toi — donne-moi le hostname admin choisi une fois en place, pour que je vérifie que `ADMIN_HOSTNAME` correspond bien.

---

## Phase 7 — Build & préparation du push
- [x] `pnpm build` dans `dashboard-ui`
- [x] Mode de service en prod décidé (copie dans `public/` ou route Express dédiée) — **route Express dédiée** : `server.js` sert `dashboard-ui/dist` directement (pas de copie), avec un catch-all pour le routing côté client (React Router)
- [x] `.env` non commité, vérifié — déjà couvert par `.gitignore`, confirmé
- [x] Tests manuels en conditions proches prod — fait dans le sandbox (un seul process `node server.js`, sans Vite dev server)
- [ ] Push sur le repo Git d'Aeroz — **à faire par toi**, je n'ai pas accès à ton repo

> **Bug corrigé au passage** : trois anciennes routes explicites (`app.get('/', ...)`, `app.get('/admin', ...)`, `app.get('/commands', ...)`) servaient encore les fichiers `public/*.html` en dur, **avant** même d'atteindre le nouveau panel React — elles auraient silencieusement servi les anciennes pages vanilla JS en production malgré tout le travail des Phases 3/4/5. Retirées ; les anciens fichiers restent malgré tout accessibles tels quels via leur nom exact (`/index.html`, `/admin.html`, `/commands.html`) grâce à `express.static`. `/terms-of-service` et `/privacy-policy` redirigent maintenant (301) vers les nouvelles routes `/terms`/`/privacy`.
> ✅ Nouveau : `DEPLOIEMENT.md` (guide complet : install, `.env`, build, lancement, pm2, checklist) et `dashboard-ui/dist` servi via une route Express dédiée avec catch-all (syntaxe Express 5 : `/*splat`, la syntaxe `'*'` seule lève une erreur sous Express 5/path-to-regexp v6+).
> ✅ Testé de bout en bout dans le sandbox (un seul `node server.js`, dist buildé) : `/`, `/admin`, `/commands`, `/premium` servent bien le nouveau panel React ; `/api/health` et `/api/nonexistent` (404) fonctionnent normalement ; anciens fichiers (`/admin.html`) toujours atteignables ; redirection 301 `/terms-of-service` → `/terms` confirmée.
