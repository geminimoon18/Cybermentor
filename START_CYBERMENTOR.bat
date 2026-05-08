@echo off
title CyberMentor Launcher
color 0A
cls

echo.
echo  ============================================
echo   CyberMentor - AI Cybersecurity Mentor
echo  ============================================
echo.

:: Set working directory to where this bat file lives
cd /d "%~dp0"

:: ── Kill any process on port 5000 ─────────────────────────────────────────
echo  [1/4] Clearing old processes...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /R ":5000 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /R ":5173 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: ── Start Flask Backend ────────────────────────────────────────────────────
echo  [2/4] Starting Flask backend...
start "CyberMentor Backend" cmd /c "cd /d "%~dp0" && python app.py & pause"

:: Wait ~4 seconds using ping trick
echo  [3/4] Waiting for backend...
ping 127.0.0.1 -n 5 >nul

:: ── Start Vite Frontend ────────────────────────────────────────────────────
echo  [4/4] Starting Vite frontend...
start "CyberMentor Frontend" cmd /c "cd /d "%~dp0" && npm run dev & pause"

:: Wait ~6 seconds for Vite to boot
ping 127.0.0.1 -n 7 >nul

:: ── Open browser ──────────────────────────────────────────────────────────
echo  Opening browser...
start "" "http://localhost:5173"

echo.
echo  ============================================
echo   CyberMentor is LIVE!
echo      Backend  -- http://localhost:5000
echo      Frontend -- http://localhost:5173
echo  ============================================
echo.
echo  Close the two server windows to shut down.
echo.
