@echo off
echo ================================================
echo   CLEAR CACHE DAN BUKA BROWSER FRESH
echo ================================================
echo.

echo [1/4] Killing all browser processes...
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
echo Done.
echo.

echo [2/4] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo [3/4] Opening Chrome in Incognito mode...
start chrome --incognito http://localhost:5173/register
echo.

echo [4/4] Instructions:
echo.
echo ================================================
echo   DI BROWSER YANG BARU BUKA:
echo ================================================
echo.
echo 1. Wait for page load (5 seconds)
echo.
echo 2. Press: Ctrl + Shift + R (5 TIMES!)
echo.
echo 3. You MUST see:
echo    - Ocean background (bukan putih!)
echo    - Large glassmorphism card
echo    - White text (bukan hitam!)
echo    - Modern design
echo.
echo ================================================
echo.
echo If STILL showing old design:
echo   1. Close ALL tabs
echo   2. Chrome Settings -^> Clear browsing data
echo   3. Time range: All time
echo   4. Clear everything
echo   5. Restart Chrome
echo   6. Visit: http://localhost:5173/register
echo.
pause
