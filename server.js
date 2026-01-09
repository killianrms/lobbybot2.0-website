const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store bot state and config
let botState = {
    isOnline: false,
    status: 'Offline',
    friends: 0,
    partySize: 0,
    partyMax: 16,
    skin: 'Unknown'
};

let managedBots = [];

let botConfig = {
    admins: [],
    joinMsg: '',
    addMsg: ''
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send current state and config to new connection
    socket.emit('state:update', botState);
    socket.emit('config:current', botConfig);
    socket.emit('manager:bots', managedBots);

    // --- Events from BOT ---
    socket.on('bot:login', (data) => {
        console.log('Bot logged in:', data);
        const { config, ...state } = data;
        
        botState = { ...botState, ...state, isOnline: true };
        if (config) botConfig = config;
        
        io.emit('state:update', botState);
        io.emit('config:current', botConfig);
    });

    socket.on('bot:update', (data) => {
        console.log('Bot state updated:', data);
        botState = { ...botState, ...data };
        io.emit('state:update', botState);
    });

    socket.on('bot:disconnect', () => {
        console.log('Bot disconnected');
        botState.isOnline = false;
        botState.status = 'Offline';
        io.emit('state:update', botState);
    });

    // --- Events from WEB DASHBOARD ---
    // Forward these commands to the bot
    socket.on('cmd:kick', (data) => io.emit('cmd:kick', data));
    socket.on('cmd:promote', (data) => io.emit('cmd:promote', data));
    socket.on('cmd:leave', () => io.emit('cmd:leave'));
    socket.on('cmd:privacy', (data) => io.emit('cmd:privacy', data));
    socket.on('cmd:add', (data) => io.emit('cmd:add', data));
    socket.on('cmd:remove', (data) => io.emit('cmd:remove', data));
    socket.on('cmd:block', (data) => io.emit('cmd:block', data));
    socket.on('cmd:status', (data) => io.emit('cmd:status', data));
    
    // NEW: Handle Config Updates
    socket.on('config:update', (newConfig) => {
        console.log('Config updated by dashboard:', newConfig);
        botConfig = { ...botConfig, ...newConfig };
        // Broadcast to Bot so it saves it
        io.emit('config:update', botConfig);
        // Broadcast to other web clients
        io.emit('config:current', botConfig);
    });

    // --- Events from MANAGER ---
    socket.on('manager:login', (data) => {
        console.log('Manager logged in:', data);
        if (data.bots) {
            managedBots = data.bots;
            io.emit('manager:bots', managedBots);
        }
    });

    socket.on('cmd:manager:add', (data) => {
    socket.on('cmd:manager:action', (data) => {
        // Forward any Multi-Bot Management action to Manager
        io.emit('cmd:manager:action', data);
    });
        // Forward add command from Web to Manager
        io.emit('cmd:manager:add', data);
    });


    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});