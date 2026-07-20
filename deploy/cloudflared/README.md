# Phase 6 — Restriction VPN du panel admin (Option C)

Ce guide met en place l'Option C du cahier des charges : `/admin` n'est **jamais**
exposé via le tunnel Cloudflare public, uniquement via un second tunnel protégé
par Cloudflare Access. `/` et `/premium` restent accessibles normalement.

Deux couches de protection, volontairement redondantes :
1. **Cloudflare** (la vraie barrière) — deux tunnels séparés, Access sur celui d'admin.
2. **Express** (`server.js`, déjà en place) — middleware `ADMIN_HOSTNAME` qui refuse
   (404) toute requête admin qui n'arrive pas par le bon nom de domaine, même en
   cas d'erreur de config côté Cloudflare.

Tout ce qui suit se fait sur **ton compte Cloudflare** (Zero Trust) — je ne peux
pas l'exécuter à ta place, mais voici exactement quoi faire.

---

## 1. Prérequis

- Un domaine déjà sur Cloudflare (`killianrms.com` d'après la config existante).
- `cloudflared` installé sur la machine qui va héberger le site (actuellement ton PC,
  ou le futur serveur dédié).
- Être connecté : `cloudflared tunnel login` (ouvre un navigateur, choisis ta zone).

## 2. Créer les deux tunnels

```bash
cloudflared tunnel create lobbybot-public
cloudflared tunnel create lobbybot-admin
```

Chaque commande affiche un UUID et écrit un fichier de credentials dans
`~/.cloudflared/<UUID>.json`. Note les deux UUID.

## 3. Créer les enregistrements DNS

```bash
cloudflared tunnel route dns lobbybot-public dashboard.killianrms.com
cloudflared tunnel route dns lobbybot-admin admin.dashboard.killianrms.com
```

Choisis le sous-domaine admin que tu veux (`admin.dashboard.killianrms.com` est un
exemple) — évite un nom trop devinable si tu veux ajouter un peu d'obscurité en
plus d'Access (ex: un nom aléatoire), Access reste la vraie protection.

## 4. Copier et compléter les fichiers de config

Les templates sont dans `deploy/cloudflared/` :
- `config-public.yml` → remplace `<TUNNEL_ID_PUBLIC>` par l'UUID du tunnel public.
- `config-admin.yml` → remplace `<TUNNEL_ID_ADMIN>` par l'UUID du tunnel admin,
  et ajuste le hostname si tu as choisi autre chose qu'`admin.dashboard.killianrms.com`.

Copie-les dans `~/.cloudflared/` (ou l'emplacement standard de ta plateforme),
par exemple `config-public.yml` → `~/.cloudflared/config-public.yml`.

## 5. Protéger le tunnel admin avec Cloudflare Access

Sur [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Access → Applications** :

1. **Add an application** → **Self-hosted**.
2. Domaine : `admin.dashboard.killianrms.com` (celui du tunnel admin).
3. Politique : **Allow** limité à ton (tes) email(s) précis — pas de règle large.
   (Authentification via "One-time PIN" par email suffit pour démarrer, pas besoin
   d'un vrai fournisseur SSO.)
4. Enregistre.

À partir de là, `admin.dashboard.killianrms.com` demande une vérification d'identité
Cloudflare **avant même d'atteindre `server.js`** — indépendamment du login
admin/mot de passe de l'app, qui reste une deuxième barrière derrière.

## 6. Lancer les deux tunnels

```bash
cloudflared tunnel --config ~/.cloudflared/config-public.yml run lobbybot-public
cloudflared tunnel --config ~/.cloudflared/config-admin.yml run lobbybot-admin
```

(Deux process séparés, à lancer tous les deux — en service systemd/tâche planifiée
une fois que ça marche manuellement, cf. section 8.)

## 7. Configurer `server.js`

Dans le `.env` du website, ajoute :

```
ADMIN_HOSTNAME=admin.dashboard.killianrms.com
```

Redémarre `server.js`. Le log doit afficher :
```
[Sécurité] Routes admin restreintes au domaine: admin.dashboard.killianrms.com
```

## 8. Tester (critère de fin de Phase 6)

- `https://dashboard.killianrms.com/` → doit fonctionner normalement.
- `https://dashboard.killianrms.com/premium` → doit fonctionner normalement.
- `https://dashboard.killianrms.com/admin` → doit renvoyer une 404 (jamais atteint côté Express).
- `https://admin.dashboard.killianrms.com/` → doit d'abord demander l'auth Cloudflare Access,
  puis afficher normalement le panel admin une fois authentifié.
- Depuis un réseau/appareil qui n'a pas l'accès Cloudflare Access → `admin.dashboard.killianrms.com`
  doit être bloqué avant même d'arriver au login de l'app.

## 9. Une fois que ça tourne en continu

Pour ne pas dépendre d'un terminal ouvert, installe `cloudflared` comme service :

```bash
sudo cloudflared service install --config ~/.cloudflared/config-public.yml
sudo cloudflared service install --config ~/.cloudflared/config-admin.yml
```

(Sur Windows, `cloudflared` propose un équivalent via `cloudflared.exe service install`
avec le même principe — un service par config.)

---

## FAQ rapide

**Pourquoi deux tunnels et pas un seul avec plusieurs hostnames ?**
Isolation : si les credentials d'un tunnel fuitent, l'autre n'est pas affecté. Un
seul tunnel avec deux hostnames aurait aussi fonctionné pour le blocage de path,
mais n'aurait pas isolé les credentials.

**Le blocage `path: ^/admin` dans `config-public.yml`, c'est suffisant ?**
Non, volontairement redondant avec Cloudflare Access + le middleware Express —
si un seul des trois a un défaut de config, les deux autres bloquent toujours.

**Et si je change le nom du sous-domaine admin plus tard ?**
Mets à jour `ADMIN_HOSTNAME` dans `.env`, le hostname dans `config-admin.yml`, et
la politique Access — les trois doivent rester cohérents.
