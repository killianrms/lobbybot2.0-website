require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Database = require('better-sqlite3');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'lobbybot-dashboard-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    },
}));

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Trop de tentatives. Réessayez dans 1 minute.' },
});

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
async function notifyDiscord(message) {
    if (!DISCORD_WEBHOOK_URL) return;
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: '[LobbyBot Dashboard] ' + message }),
        });
    } catch (e) { console.error('Discord notify failed:', e.message); }
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    notifyDiscord('🔴 **Crash critique** (uncaughtException): ' + err.message).finally(() => process.exit(1));
});
process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    console.error('Unhandled rejection:', reason);
    notifyDiscord('🔴 **Crash critique** (unhandledRejection): ' + msg).finally(() => process.exit(1));
});

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'lobbybot.db');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const db = new Database(DB_FILE, { readonly: false, timeout: 30000 });
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 30000');
db.pragma('wal_autocheckpoint = 1000');
db.pragma('cache_size = -64000');
console.log('DB: ' + DB_FILE);

db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        failed_attempts INTEGER DEFAULT 0,
        locked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS epic_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        pseudo TEXT,
        password_enc TEXT,
        secret_id TEXT,
        device_id TEXT,
        account_id TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used_at DATETIME
    );
`);
console.log('Tables ready');

const stmts = {
    checkAdmin: db.prepare('SELECT * FROM dashboard_admins WHERE email = ?'),
    insertAdmin: db.prepare('INSERT INTO dashboard_admins (email, password_hash) VALUES (?, ?)'),
    updateAdmin: db.prepare('UPDATE dashboard_admins SET failed_attempts = ?, locked = ? WHERE id = ?'),
    resetAdmin: db.prepare('UPDATE dashboard_admins SET failed_attempts = 0 WHERE id = ?'),
    deleteAdmin: db.prepare('DELETE FROM dashboard_admins WHERE id = ?'),
    listAdmins: db.prepare('SELECT id, email, created_at FROM dashboard_admins ORDER BY created_at DESC'),
    seedAdmin: db.prepare('SELECT id FROM dashboard_admins WHERE email = ?'),
    getAllBots: db.prepare('SELECT * FROM epic_accounts WHERE is_active IS NOT 0'),
    upsertBot: db.prepare(`
        INSERT INTO epic_accounts (email, pseudo, device_id, account_id, secret_id, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(email) DO UPDATE SET
            pseudo = excluded.pseudo, device_id = excluded.device_id,
            account_id = excluded.account_id, secret_id = excluded.secret_id, is_active = 1
    `),
    deleteBot: db.prepare('DELETE FROM epic_accounts WHERE email = ?'),
};

const seedEmail = process.env.ADMIN_SEED_EMAIL;
const seedPassword = process.env.ADMIN_SEED_PASSWORD;
if (seedEmail && seedPassword) {
    try {
        const existing = stmts.seedAdmin.get(seedEmail);
        if (!existing) {
            stmts.insertAdmin.run(seedEmail, bcrypt.hashSync(seedPassword, 12));
            console.log('Admin initial: ' + seedEmail);
        }
    } catch (e) { console.error('Seed error:', e.message); }
}

async function backup() {
    let src;
    try {
        const now = new Date();
        const fn = 'lobbybot_' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '_' + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + '.db';
        const dest = path.join(BACKUP_DIR, fn);
        src = new Database(DB_FILE, { readonly: true });
        await src.backup(dest);
        src.close();
        console.log('Backup: ' + fn);
        const files = fs.readdirSync(BACKUP_DIR).sort().reverse().slice(30);
        for (const f of files) fs.unlinkSync(path.join(BACKUP_DIR, f));
    } catch (e) {
        console.error('Backup error:', e.message);
        if (src && src.open) { try { src.close(); } catch (_) {} }
        notifyDiscord('⚠️ Backup DB échoué: ' + e.message);
    }
}
setInterval(backup, 60 * 60 * 1000);
console.log('Auto-backup every 60 min');

let managedBots = [];
let globalConfig = { status: 'Utilisez le code créateur : aeroz', joinMsg: '', addMsg: '' };

const commandQueue = [];
const MAX_QUEUE_AGE = 5 * 60 * 1000;

function flushQueue() {
    const now = Date.now();
    const fresh = commandQueue.filter(c => now - c.timestamp.getTime() < MAX_QUEUE_AGE);
    commandQueue.length = 0;
    for (const cmd of fresh) io.emit('cmd:manager:action', { target: cmd.target, action: cmd.action, data: cmd.data });
}

function purgeExpired() {
    const now = Date.now();
    for (let i = commandQueue.length - 1; i >= 0; i--) {
        if (now - commandQueue[i].timestamp.getTime() > MAX_QUEUE_AGE) commandQueue.splice(i, 1);
    }
    io.emit('cmd:queue:update', commandQueue.length);
}
setInterval(purgeExpired, 60 * 1000);

const activityLog = [];
const MAX_LOG = 100;
const ACTION_ICONS = {
    leave: '👋', privacy: '🔒', kick: '👢', promote: '👑',
    add: '➕', remove: '🗑️', skin: '👗', backpack: '🎒', pickaxe: '⛏️',
    emote: '💃', stopdanse: '⏹️', level: '⭐', ready: '✅',
    unready: '❌', connect: '🟢', disconnect: '🔴',
    config: '⚙️', addBot: '🤖', deleteBot: '🗑️', restartBot: '🔄',
};

function logActivity(entry) {
    const event = { id: Date.now(), timestamp: new Date().toISOString(), icon: ACTION_ICONS[entry.type] || '•', ...entry };
    activityLog.unshift(event);
    if (activityLog.length > MAX_LOG) activityLog.pop();
    io.emit('activity:new', event);
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/terms-of-service', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms-of-service.html')));
app.get('/privacy-policy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy-policy.html')));

function isAuthenticated(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.status(401).json({ error: 'Non authentifié' });
}

app.post('/api/auth/login', loginLimiter, (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    try {
        const admin = stmts.checkAdmin.get(email);
        if (!admin) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
        if (admin.locked) return res.status(403).json({ error: 'Compte bloqué.' });
        const valid = bcrypt.compareSync(password, admin.password_hash);
        if (!valid) {
            const na = admin.failed_attempts + 1;
            stmts.updateAdmin.run(na, na >= 3 ? 1 : 0, admin.id);
            return res.status(401).json({ error: na >= 3 ? 'Compte bloqué.' : (3 - na) + ' restante(s).' });
        }
        stmts.resetAdmin.run(admin.id);
        req.session.authenticated = true;
        req.session.adminEmail = email;
        return res.json({ success: true });
    } catch (e) { return res.status(500).json({ error: 'Erreur serveur.' }); }
});

app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })); });
app.get('/api/auth/me', (req, res) => res.json(req.session && req.session.authenticated ? { authenticated: true, email: req.session.adminEmail } : { authenticated: false }));

app.get('/api/bots', (req, res) => {
    try {
        const rows = stmts.getAllBots.all();
        const bots = rows.filter(r => r.secret_id).map(r => ({
            name: r.pseudo || r.email, email: r.email, isOnline: false, friends: 0, ping: null, fromDB: true
        }));
        const rtByName = new Map(managedBots.map(b => [b.name, b]));
        for (const bot of bots) {
            const rt = rtByName.get(bot.name);
            if (rt) { bot.isOnline = rt.isOnline ?? bot.isOnline; bot.friends = rt.friends ?? bot.friends; bot.ping = rt.ping ?? bot.ping; }
        }
        return res.json(bots);
    } catch (e) { return res.status(500).json({ error: 'Erreur serveur.' }); }
});

app.post('/api/bots/add', isAuthenticated, (req, res) => {
    const { pseudo, email, deviceAuth } = req.body || {};
    if (!email || !deviceAuth) return res.status(400).json({ error: 'Email et device auth requis.' });
    try {
        stmts.upsertBot.run(email, pseudo, deviceAuth.deviceId, deviceAuth.accountId, deviceAuth.secret);
        return res.json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.delete('/api/bots/:email', isAuthenticated, (req, res) => {
    try {
        const result = stmts.deleteBot.run(req.params.email);
        if (result.changes === 0) return res.status(404).json({ error: 'Bot non trouvé.' });
        return res.json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post('/api/bots/:email/restart', isAuthenticated, (req, res) => {
    io.emit('cmd:manager:restart', { pseudo: req.params.email });
    return res.json({ success: true });
});

app.get('/api/admin/users', isAuthenticated, (req, res) => res.json(stmts.listAdmins.all()));

app.post('/api/admin/users', isAuthenticated, (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    try {
        stmts.insertAdmin.run(email, bcrypt.hashSync(password, 12));
        return res.json({ success: true });
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email déjà utilisé.' });
        return res.status(500).json({ error: e.message });
    }
});

app.delete('/api/admin/users/:id', isAuthenticated, (req, res) => {
    try { stmts.deleteAdmin.run(req.params.id); return res.json({ success: true }); }
    catch (e) { return res.status(500).json({ error: e.message }); }
});

app.get('/api/activity', (req, res) => res.json(activityLog.slice(0, MAX_LOG)));
app.get('/api/config', (req, res) => res.json(globalConfig));
app.get('/api/health', (req, res) => res.json({ status: 'ok', botsConnected: managedBots.length, queueSize: commandQueue.length, uptime: process.uptime(), db: DB_FILE }));

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('manager:bots', managedBots);
    socket.emit('globalConfig:current', globalConfig);
    socket.emit('activity:log', activityLog.slice(0, MAX_LOG));

    socket.on('admin:auth', (data, callback) => {
        const { email, password } = data || {};
        if (!email || !password) return callback({ success: false, error: 'Email et mot de passe requis.' });
        try {
            const admin = stmts.checkAdmin.get(email);
            if (!admin) return callback({ success: false, error: 'Email ou mot de passe incorrect.' });
            if (admin.locked) return callback({ success: false, error: 'Compte bloqué.' });
            const valid = bcrypt.compareSync(password, admin.password_hash);
            if (!valid) {
                const na = admin.failed_attempts + 1;
                stmts.updateAdmin.run(na, na >= 3 ? 1 : 0, admin.id);
                return callback({ success: false, error: 'Mot de passe incorrect.' });
            }
            stmts.resetAdmin.run(admin.id);
            return callback({ success: true });
        } catch (e) { return callback({ success: false, error: 'Erreur serveur.' }); }
    });

    socket.on('manager:login', (data) => {
        console.log('Manager connected, bots:', data.botCount);
        if (data.bots) { managedBots = data.bots; io.emit('manager:bots', managedBots); }
        socket.emit('globalConfig:current', globalConfig);
        flushQueue();
    });

    socket.on('cmd:manager:add', (data) => { io.emit('cmd:manager:add', data); });
    socket.on('cmd:manager:action', (data) => {
        io.emit('cmd:manager:action', data);
        socket.emit('action:sent', { target: data.target, action: data.action });
    });
    socket.on('action:result', (data) => { io.emit('action:result', data); });
    socket.on('admin:addBot', (botData) => { io.emit('cmd:manager:addBot', botData); });
    socket.on('admin:addBotResult', (data) => { io.emit('admin:addBotResult', data); });
    socket.on('config:globalUpdate', (newConfig) => {
        globalConfig = { ...globalConfig, ...newConfig };
        io.emit('config:globalUpdate', globalConfig);
        io.emit('globalConfig:current', globalConfig);
    });
    socket.on('bot:login', (data) => { logActivity({ type: 'connect', bot: data.name || '?', message: 'Bot connecté' }); });
    socket.on('bot:disconnect', (data) => { logActivity({ type: 'disconnect', bot: data?.name || '?', message: 'Bot déconnecté' }); });
    socket.on('disconnect', () => { console.log('User disconnected:', socket.id); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Dashboard running on port ' + PORT);
    console.log('DB: ' + DB_FILE);
    console.log('Auto-backup: every 60 min');
});

module.exports = { app, server, io };
