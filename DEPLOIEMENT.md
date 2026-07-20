# Déploiement en production — lobbybot2.0-website

Ce guide couvre la mise en prod du website (backend Express + panel React). Pour
la restriction VPN du panel admin, voir `deploy/cloudflared/README.md` (Phase 6).

## 1. Installer les dépendances

```bash
pnpm install
```

(Workspace pnpm : installe à la fois les deps du backend racine et de
`dashboard-ui` en une seule commande — voir `pnpm-workspace.yaml`.)

Si `better-sqlite3` est bloqué par pnpm (`ERR_PNPM_IGNORED_BUILDS`) :
```bash
pnpm approve-builds
pnpm rebuild better-sqlite3
```

## 2. Configurer `.env`

```bash
cp .env.example .env
```

Renseigne au minimum : `SESSION_SECRET`, `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`
(uniquement pour le tout premier démarrage), `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET`
(panel premium, Phase 5), et `ADMIN_HOSTNAME` (restriction VPN, Phase 6) une fois
le tunnel Cloudflare admin en place.

**`.env` ne doit jamais être commité** — déjà couvert par `.gitignore`, vérifié.

## 3. Builder le panel React

```bash
cd dashboard-ui
pnpm build
cd ..
```

Ça génère `dashboard-ui/dist/` — c'est ce dossier que `server.js` sert
automatiquement (voir section suivante). Il n'est **pas** committé dans Git
(`dashboard-ui/.gitignore` l'exclut), donc **cette étape est à refaire à chaque
déploiement** après un `git pull`.

## 4. Lancer le serveur

```bash
node server.js
```

Un seul process sert tout :
- `/`, `/premium`, `/admin`, `/commands`, `/terms`, `/privacy` → panel React (`dashboard-ui/dist`)
- `/api/*` → API backend
- `/socket.io` → temps réel (admin, premium, bot Discord)
- Anciennes pages (fallback, non liées depuis le nouveau panel) : toujours
  accessibles directement par leur nom de fichier — `/index.html`, `/admin.html`,
  `/commands.html`, `/terms-of-service` et `/privacy-policy` redirigent
  désormais vers `/terms`/`/privacy`.

Si `dashboard-ui/dist` est absent (étape 3 pas faite), `server.js` démarre quand
même (rien ne casse) mais log un avertissement et ne sert que l'API — pratique
en dev avec `pnpm dev` côté `dashboard-ui` à la place.

## 5. Garder le process actif (pm2 recommandé)

```bash
npm install -g pm2
pm2 start server.js --name lobbybot-website
pm2 save
pm2 startup   # affiche la commande à lancer une fois pour démarrer pm2 au boot
```

(Alternative : un service systemd si tu préfères éviter une dépendance globale
supplémentaire — dis-le-moi si tu veux que je prépare le fichier `.service`.)

## 6. Checklist avant de pousser en prod

- [ ] `pnpm build` dans `dashboard-ui` sans erreur
- [ ] `.env` rempli, jamais commité (`git status` ne doit rien montrer dessus)
- [ ] `node server.js` démarre sans erreur, log `Panel React servi depuis dashboard-ui/dist`
- [ ] Test manuel : `/`, `/premium`, `/admin`, `/commands` chargent le nouveau panel React (pas les anciennes pages)
- [ ] Tunnels Cloudflare + `ADMIN_HOSTNAME` en place si la restriction VPN (Phase 6) doit être active dès le lancement
- [ ] `git push` vers le repo d'Aeroz
