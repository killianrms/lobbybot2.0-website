const socket = io();
let authenticated = false;
let allBots = [];

// --- TOAST ---
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// --- AUTH ---
async function tryLogin() {
    const email = document.getElementById('emailInput').value.trim();
    const pass = document.getElementById('passwordInput').value;
    if (!email || !pass) return;

    document.getElementById('loginError').style.display = 'none';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
        });
        const result = await res.json();
        if (result.success) {
            authenticated = true;
            // La socket a été ouverte avant le login : on la reconnecte pour que
            // son handshake porte la session admin (autorise les commandes bots).
            socket.disconnect().connect();
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'flex';
            showToast('Connecté en tant qu\'admin', 'success');
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('loginError').textContent = result.error;
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
    } catch (e) {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('loginError').textContent = 'Erreur de connexion';
    }
}

document.getElementById('loginBtn').addEventListener('click', tryLogin);
document.getElementById('emailInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') document.getElementById('passwordInput').focus();
});
document.getElementById('passwordInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') tryLogin();
});

// --- SOCKET EVENTS ---
socket.on('manager:bots', (bots) => {
    allBots = bots.map(b => typeof b === 'string' ? { name: b, friends: 0, isOnline: true } : b);
    renderBotList();
    updateStats();
});

socket.on('globalConfig:current', (config) => {
    if (config.status !== undefined) document.getElementById('cfgStatus').value = config.status;
    if (config.joinMsg !== undefined) document.getElementById('cfgJoinMsg').value = config.joinMsg;
    if (config.addMsg !== undefined) document.getElementById('cfgAddMsg').value = config.addMsg;
});

// --- RENDER BOT LIST ---
function renderBotList() {
    const list = document.getElementById('botList');
    const count = document.getElementById('botCountLabel');
    count.textContent = `${allBots.length} bot(s)`;

    if (allBots.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.4;font-size:0.85rem;">Aucun bot connecté</div>';
        return;
    }

    list.innerHTML = '';
    allBots
        .slice()
        .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
        .forEach(bot => {
            const div = document.createElement('div');
            div.className = 'bot-item';
            div.innerHTML = `
                <span class="bot-name">${bot.name}</span>
                <div class="bot-meta">
                    <span>${bot.friends ?? 0} amis</span>
                    <span class="status-dot ${bot.isOnline ? 'online' : 'offline'}"></span>
                </div>
            `;
            list.appendChild(div);
        });
}

function updateStats() {
    const online = allBots.filter(b => b.isOnline).length;
    const totalFriends = allBots.reduce((sum, b) => sum + (b.friends || 0), 0);
    document.getElementById('statOnline').textContent = online;
    document.getElementById('statTotal').textContent = allBots.length;
    document.getElementById('statFriends').textContent = totalFriends;
}

// --- APPLY CONFIG ---
function applyConfig() {
    if (!authenticated) {
        showToast('Non authentifié', 'error');
        return;
    }

    const config = {
        status: document.getElementById('cfgStatus').value.trim(),
        joinMsg: document.getElementById('cfgJoinMsg').value.trim(),
        addMsg: document.getElementById('cfgAddMsg').value.trim(),
    };

    const btn = document.getElementById('applyBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Application en cours...';

    socket.emit('config:globalUpdate', config);

    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = '✓ Appliquer maintenant';
    }, 2000);

    showToast('Configuration appliquée à tous les bots !', 'success');
}

document.getElementById('applyBtn').addEventListener('click', applyConfig);
