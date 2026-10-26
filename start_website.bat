@echo off
title SE7EN Storefront
cd /d "%~dp0"
echo ===================================================
echo   Starting SE7EN Streetwear Storefront
echo   Open in browser: http://localhost:5173
echo ===================================================
echo.
pnpm run dev
pause
