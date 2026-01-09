# 🌐 LobbyBot 2.0 - Web Dashboard

L'interface de contrôle pour votre armée de LobbyBots.

## 🚀 Fonctionnalités

*   **Vue d'ensemble** : Liste tous les bots connectés et leur statut (En ligne, Amis, Ping).
*   **Contrôle en temps réel** : Kick, Promote, Change Privacy depuis le web.
*   **Socket.IO** : Communication instantanée avec le Manager.
*   **Design** : Interface moderne "Space/Starfield".

## 🛠️ Installation

Ce projet est conçu pour être lancé via le `docker-compose.yml` situé dans le dépôt **lobbybot2.0-discord**.

Si vous souhaitez le lancer seul pour le développement :

```bash
npm install
node server.js
```

Le serveur écoute sur le port `3000`.

## 🔗 Architecture

*   **Frontend** : HTML5, CSS3, Vanilla JS.
*   **Backend** : Node.js, Express, Socket.IO.
