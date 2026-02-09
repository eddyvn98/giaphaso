@echo off
title GIA PHA SO - CLOUD SYSTEM
cd /d d:\giaphaso

echo [1/2] Starting Local Server...
start /b cmd /c "npm run dev"

echo [2/2] Starting Global Tunnel...
python scripts/start-tunnel.py

pause
