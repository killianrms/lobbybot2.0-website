@echo off
chcp 65001 >nul
title LobbyBot Dashboard

:loop
echo [%date% %time%] Starting dashboard...
node server.js
echo [%date% %time%] Server crashed, restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto loop
