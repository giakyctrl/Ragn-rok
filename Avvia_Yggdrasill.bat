@echo off
chcp 65001 > nul
title YGGDRASILL - Journey to Ragnarok (Desktop)
color 0b

echo ==============================================================================
echo                      YGGDRASILL - JOURNEY TO RAGNAROK                         
echo                         Desktop Client per Windows                            
echo ==============================================================================
echo.
echo [1/2] Rimozione flag Mark-of-the-Web (Anti-Falso Positivo Windows Defender)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File -ErrorAction SilentlyContinue"

echo [2/2] Avvio di Yggdrasill in corso...
echo.

if exist "%~dp0Yggdrasill.exe" (
    start "" "%~dp0Yggdrasill.exe"
    exit /b 0
)

if exist "%~dp0dist-electron\win-unpacked\Yggdrasill.exe" (
    start "" "%~dp0dist-electron\win-unpacked\Yggdrasill.exe"
    exit /b 0
)

if exist "%~dp0dist\win-unpacked\Yggdrasill.exe" (
    start "" "%~dp0dist\win-unpacked\Yggdrasill.exe"
    exit /b 0
)

for /r "%~dp0" %%f in (Yggdrasill*.exe) do (
    start "" "%%f"
    exit /b 0
)

echo [ERRORE] Eseguibile principale non trovato nella cartella corrente.
echo Assicurati di aver estratto tutti i file dall'archivio ZIP.
pause
