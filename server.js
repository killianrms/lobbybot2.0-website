const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ──────────────────────────────────────────────────────────
//  SECURITY
// ──────────────────────────────────────────────────────────
app.use(helmet());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'lobbybot-dashboard-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24h
    },
}));

// Rate limiting on sensitive routes
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 attempts per minute
    message: { error: 'Trop de tentatives. Réessayez dans 1 minute.' },
});

// ──────────────────────────────────────────────────────────
//  DATABASE
// ──────────────────────────────────────────────────────────
let dbPool = null;
try {
    if (process.env.DB_HOST) {
        const { Pool } = require('pg');
        dbPool = new Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        });
        console.log('🗄️  PostgreSQL pool created');
    }
} catch (e) {
    console.warn('⚠️  pg not available');
}

let bcrypt = null;
try {
    bcrypt = require('bcryptjs');
} catch (e) {
    console.warn('⚠️  bcryptjs not available');
}

async function initAdminTable() {
    if (!dbPool || !bcrypt) return;
    try {
        await dbPool.query(`
            CREATE TABLE IF NOT EXISTS dashboard_admins (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                failed_attempts INTEGER DEFAULT 0,
                locked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        const seedEmail = process.env.ADMIN_SEED_EMAIL;
        const seedPassword = process.env.ADMIN_SEED_PASSWORD;
        if (seedEmail && seedPassword) {
            const existing = await dbPool.query(
                'SELECT id FROM dashboard_admins WHERE email = $1',
                [seedEmail]
            );
            if (existing.rows.length === 0) {
                const hash = await bcrypt.hash(seedPassword, 12);
                await dbPool.query(
                    'INSERT INTO dashboard_admins (email, password_hash) VALUES ($1, $2)',
                    [seedEmail, hash]
                );
                console.log(`✅ Admin initial créé : ${seedEmail}`);
            }
        }
        console.log('✅ Table dashboard_admins prête');
    } catch (e) {
        console.error('❌ Erreur init admin table:', e.message);
    }
}

// ──────────────────────────────────────────────────────────
//  STATE
// ──────────────────────────────────────────────────────────
let managedBots = []; // Real-time data from Manager via Socket.IO
let globalConfig = {
    status: 'Utilisez le code créateur : aeroz',
    joinMsg: '',
    addMsg: ''
};

// ──────────────────────────────────────────────────────────
//  COMMAND QUEUE
// ──────────────────────────────────────────────────────────
const commandQueue = [];
const MAX_QUEUE_AGE = 5 * 60 * 1000; // 5 minutes

function enqueueCommand(cmd) {
    const entry = {
        id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...cmd,
        timestamp: new Date(),
        retryCount: 0,
        delivered: false,
    };
    commandQueue.push(entry);
    io.emit('cmd:queue:update', commandQueue.length);
    return entry;
}

function flushQueue() {
    const now = Date.now();
    const fresh = commandQueue.filter(c => now - c.timestamp.getTime() < MAX_QUEUE_AGE);
    const delivered = [];
    commandQueue.length = 0;
    for (const cmd of fresh) {
        io.emit('cmd:manager:action', { target: cmd.target, action: cmd.action, data: cmd.data });
        delivered.push(cmd.id);
    }
    if (delivered.length > 0) {
        console.log(`📤 Queue flushed: ${delivered.length} commands`);
    }
}

function purgeExpired() {
    const now = Date.now();
    const before = commandQueue.length;
    for (let i = commandQueue.length - 1; i >= 0; i--) {
        if (now - commandQueue[i].timestamp.getTime() > MAX_QUEUE_AGE) {
            commandQueue.splice(i, 1);
        }
    }
    if (commandQueue.length !== before) {
        io.emit('cmd:queue:update', commandQueue.length);
    }
}
setInterval(purgeExpired, 60 * 1000);

// ──────────────────────────────────────────────────────────
//  ACTIVITY LOG
// ──────────────────────────────────────────────────────────
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
    const event = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        icon: ACTION_ICONS[entry.type] || '•',
        ...entry,
    };
    activityLog.unshift(event);
    if (activityLog.length > MAX_LOG) activityLog.pop();
    io.emit('activity:new', event);
}

// ──────────────────────────────────────────────────────────
//  HELPER: merge DB bots with real-time state
// ──────────────────────────────────────────────────────────
function getMergedBots() {
    const rtByName = new Map(managedBots.map(b => [b.name, b]));
    const seen = new Set();
    for (const b of managedBots) seen.add(b.name);

    return Array.from(rtByName.values()).map(b => ({
        name: b.name,
        friends: b.friends ?? 0,
        isOnline: b.isOnline !== undefined ? b.isOnline : true,
        ping: b.ping,
        fromRT: true,
    })).concat(
        // Bots in DB but not in RT
        []
    );
}

// ──────────────────────────────────────────────────────────
//  ROUTES
// ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ──────────────────────────────────────────────────────────
//  API: Authentication
// ──────────────────────────────────────────────────────────
function isAuthenticated(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.status(401).json({ error: 'Non authentifié' });
}

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

    try {
        if (dbPool && bcrypt) {
            const result = await dbPool.query('SELECT * FROM dashboard_admins WHERE email = $1', [email]);
            if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

            const admin = result.rows[0];
            if (admin.locked) return res.status(403).json({ error: 'Compte bloqué.' });

            const valid = await bcrypt.compare(password, admin.password_hash);
            if (!valid) {
                const newAttempts = admin.failed_attempts + 1;
                const locked = newAttempts >= 3;
                await dbPool.query('UPDATE dashboard_admins SET failed_attempts = $1, locked = $2 WHERE id = $3', [newAttempts, locked, admin.id]);
                return res.status(401).json({ error: locked ? 'Compte bloqué après 3 tentatives.' : `Mot de passe incorrect. ${3 - newAttempts} restante(s).` });
            }

            await dbPool.query('UPDATE dashboard_admins SET failed_attempts = 0 WHERE id = $1', [admin.id]);
            req.session.authenticated = true;
            req.session.adminEmail = email;
            return res.json({ success: true });
        }

        const fallbackPass = process.env.ADMIN_PASSWORD || 'admin';
        if (password === fallbackPass) {
            req.session.authenticated = true;
            req.session.adminEmail = email;
            return res.json({ success: true });
        }
        return res.status(401).json({ error: 'Mot de passe incorrect.' });
    } catch (e) {
        console.error('Auth error:', e.message);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/auth/me', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.json({ authenticated: true, email: req.session.adminEmail });
    }
    res.json({ authenticated: false });
});

// ──────────────────────────────────────────────────────────
//  API: Bots (from DB)
// ──────────────────────────────────────────────────────────
app.get('/api/bots', async (req, res) => {
    try {
        if (!dbPool) return res.json([]);
        const result = await dbPool.query('SELECT * FROM epic_accounts WHERE is_active IS DISTINCT FROM false');
        const bots = result.rows
            .filter(row => row.secret_id)
            .map(row => ({
                name: row.pseudo || row.email,
                email: row.email,
                isOnline: false,
                friends: 0,
                ping: null,
                fromDB: true,
            }));
        // Merge with RT state
        const rtByName = new Map(managedBots.map(b => [b.name, b]));
        for (const bot of bots) {
            const rt = rtByName.get(bot.name);
            if (rt) {
                bot.isOnline = rt.isOnline ?? bot.isOnline;
                bot.friends = rt.friends ?? bot.friends;
                bot.ping = rt.ping ?? bot.ping;
            }
        }
        return res.json(bots);
    } catch (e) {
        console.error('GET /api/bots error:', e.message);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ──────────────────────────────────────────────────────────
//  API: Bot management (admin only)
// ──────────────────────────────────────────────────────────
app.post('/api/bots/add', isAuthenticated, async (req, res) => {
    if (!dbPool || !bcrypt) return res.status(500).json({ error: 'DB non disponible.' });
    const { pseudo, email, password, deviceAuth } = req.body || {};
    if (!email || !deviceAuth) return res.status(400).json({ error: 'Email et device auth requis.' });

    try {
        await dbPool.query(`
            INSERT INTO epic_accounts (email, pseudo, device_id, account_id, secret_id, is_active)
            VALUES ($1, $2, $3, $4, $5, TRUE)
            ON CONFLICT (email) DO UPDATE SET
                pseudo = EXCLUDED.pseudo, device_id = EXCLUDED.device_id,
                account_id = EXCLUDED.account_id, secret_id = EXCLUDED.secret_id, is_active = TRUE
        `, [email, pseudo, deviceAuth.deviceId, deviceAuth.accountId, deviceAuth.secret]);
        logActivity({ type: 'addBot', bot: pseudo || email, message: `Bot ajouté : ${pseudo || email}` });
        return res.json({ success: true });
    } catch (e) {
        console.error('Add bot error:', e.message);
        return res.status(500).json({ error: e.message });
    }
});

app.delete('/api/bots/:email', isAuthenticated, async (req, res) => {
    if (!dbPool) return res.status(500).json({ error: 'DB non disponible.' });
    try {
        const result = await dbPool.query('DELETE FROM epic_accounts WHERE email = $1', [req.params.email]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Bot non trouvé.' });
        logActivity({ type: 'deleteBot', bot: req.params.email, message: `Bot supprimé : ${req.params.email}` });
        return res.json({ success: true });
    } catch (e) {
        console.error('Delete bot error:', e.message);
        return res.status(500).json({ error: e.message });
    }
});

app.post('/api/bots/:email/restart', isAuthenticated, async (req, res) => {
    // Signal to Manager to restart this bot (we emit a special command)
    const { pseudo } = req.body || {};
    io.emit('cmd:manager:restart', { pseudo: pseudo || req.params.email });
    logActivity({ type: 'restartBot', bot: pseudo || req.params.email, message: `Redémarrage demandé pour ${pseudo || req.params.email}` });
    return res.json({ success: true });
});

// ──────────────────────────────────────────────────────────
//  API: Admin users
// ──────────────────────────────────────────────────────────
app.get('/api/admin/users', isAuthenticated, async (req, res) => {
    if (!dbPool) return res.json([]);
    try {
        const result = await dbPool.query('SELECT id, email, created_at FROM dashboard_admins ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/users', isAuthenticated, async (req, res) => {
    if (!dbPool || !bcrypt) return res.status(500).json({ error: 'DB non disponible.' });
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    try {
        const hash = await bcrypt.hash(password, 12);
        await dbPool.query('INSERT INTO dashboard_admins (email, password_hash) VALUES ($1, $2)', [email, hash]);
        logActivity({ type: 'config', bot: '-', message: `Nouvel admin créé : ${email}` });
        return res.json({ success: true });
    } catch (e) {
        if (e.code === '23505') return res.status(409).json({ error: 'Email déjà utilisé.' });
        return res.status(500).json({ error: e.message });
    }
});

app.delete('/api/admin/users/:id', isAuthenticated, async (req, res) => {
    if (!dbPool) return res.status(500).json({ error: 'DB non disponible.' });
    try {
        await dbPool.query('DELETE FROM dashboard_admins WHERE id = $1', [req.params.id]);
        logActivity({ type: 'config', bot: '-', message: `Admin supprimé : ${req.params.id}` });
        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// ──────────────────────────────────────────────────────────
//  API: Activity log
// ──────────────────────────────────────────────────────────
app.get('/api/activity', (req, res) => {
    return res.json(activityLog.slice(0, MAX_LOG));
});

// ──────────────────────────────────────────────────────────
//  API: Global config
// ──────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
    return res.json(globalConfig);
});

// ──────────────────────────────────────────────────────────
//  API: Health
// ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    return res.json({
        status: 'ok',
        botsConnected: managedBots.length,
        queueSize: commandQueue.length,
        uptime: process.uptime(),
    });
});

// ──────────────────────────────────────────────────────────
//  SOCKET.IO
// ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.emit('manager:bots', managedBots);
    socket.emit('globalConfig:current', globalConfig);
    socket.emit('activity:log', activityLog.slice(0, MAX_LOG));

    // ── ADMIN AUTH (legacy — admin.html compat) ──────────────
    socket.on('admin:auth', async (data, callback) => {
        const { email, password } = data || {};
        if (!email || !password) return callback({ success: false, error: 'Email et mot de passe requis.' });

        try {
            if (dbPool && bcrypt) {
                const result = await dbPool.query('SELECT * FROM dashboard_admins WHERE email = $1', [email]);
                if (result.rows.length === 0) return callback({ success: false, error: 'Email ou mot de passe incorrect.' });
                const admin = result.rows[0];
                if (admin.locked) return callback({ success: false, error: 'Compte bloqué.' });
                const valid = await bcrypt.compare(password, admin.password_hash);
                if (!valid) {
                    const newAttempts = admin.failed_attempts + 1;
                    const locked = newAttempts >= 3;
                    await dbPool.query('UPDATE dashboard_admins SET failed_attempts = $1, locked = $2 WHERE id = $3', [newAttempts, locked, admin.id]);
                    return callback({ success: false, error: locked ? 'Compte bloqué.' : `${3 - newAttempts} restantes.` });
                }
                await dbPool.query('UPDATE dashboard_admins SET failed_attempts = 0 WHERE id = $1', [admin.id]);
                socket.session.authenticated = true;
                return callback({ success: true });
            }
            const fallbackPass = process.env.ADMIN_PASSWORD || 'admin';
            return callback({ success: password === fallbackPass });
        } catch (e) {
            return callback({ success: false, error: 'Erreur serveur.' });
        }
    });

    // ── MANAGER EVENTS ──────────────────────────────────────
    socket.on('manager:login', (data) => {
        console.log('Manager connected, bots:', data.botCount);
        if (data.bots) {
            managedBots = data.bots;
            io.emit('manager:bots', managedBots);
        }
        socket.emit('globalConfig:current', globalConfig);
        // Flush any queued commands
        flushQueue();
    });

    socket.on('cmd:manager:add', (data) => {
        io.emit('cmd:manager:add', data);
        logActivity({ type: 'add', bot: 'auto', target: data.target, message: `Ajout ami : ${data.target}` });
    });

    socket.on('cmd:manager:action', (data) => {
        io.emit('cmd:manager:action', data);
        socket.emit('action:sent', { target: data.target, action: data.action });
        logActivity({ type: data.action, bot: data.target, target: data.data || '', message: `${data.action} sur ${data.target}${data.data ? ' → ' + data.data : ''}` });
    });

    socket.on('action:result', (data) => {
        io.emit('action:result', data);
        logActivity({ type: data.action, bot: data.target, message: `[${data.target}] ${data.result}` });
    });

    socket.on('admin:addBot', (botData) => {
        console.log('Admin adding bot:', botData.pseudo);
        io.emit('cmd:manager:addBot', botData);
        logActivity({ type: 'addBot', bot: botData.pseudo, message: `Nouveau bot ajouté : ${botData.pseudo}` });
    });

    socket.on('admin:addBotResult', (data) => {
        io.emit('admin:addBotResult', data);
    });

    socket.on('config:globalUpdate', (newConfig) => {
        console.log('Global config updated by admin');
        globalConfig = { ...globalConfig, ...newConfig };
        io.emit('config:globalUpdate', globalConfig);
        io.emit('globalConfig:current', globalConfig);
        logActivity({ type: 'config', bot: '-', message: `Config mise à jour — status: "${newConfig.status || '—'}"` });
    });

    socket.on('bot:login', (data) => { logActivity({ type: 'connect', bot: data.name || '?', message: 'Bot connecté' }); });
    socket.on('bot:disconnect', (data) => { logActivity({ type: 'disconnect', bot: data?.name || '?', message: 'Bot déconnecté' }); });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ──────────────────────────────────────────────────────────
//  STARTUP
// ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

initAdminTable().then(() => {
    server.listen(PORT, () => {
        console.log(`\n🚀 Dashboard running on port ${PORT}`);
        if (dbPool) {
            console.log('🗄️  Admin auth: PostgreSQL');
            console.log('🗄️  Bot data: PostgreSQL');
        } else {
            console.log('⚠️  Admin auth: env var ADMIN_PASSWORD (fallback)');
        }
        console.log(`🔒 Helmet enabled`);
        console.log(`🔑 Session enabled`);
    });
});

module.exports = { app, server, io };
