const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store bot state
let botState = {
    isOnline: false,
    status: 'Offline',
    friends: 0,
    partySize: 0,
    partyMax: 16,
    skin: 'Unknown'
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send current state to new connection
    socket.emit('state:update', botState);

    // --- Events from BOT ---
    socket.on('bot:login', (data) => {
        console.log('Bot logged in:', data);
        botState = { ...botState, ...data, isOnline: true };
        io.emit('state:update', botState);
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
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
