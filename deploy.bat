@echo off
cd /d "C:\Users\User\Projects\Aerovise"
if not exist ".git" git init
git remote remove origin 2>nul
git remote add origin https://github.com/saifalamgir355/aerovise.git
git branch -M main
git add -A
git commit -m "Aerovise v5.1: seven works, new contacts"
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push rejected - forcing...
  git push -u origin main --force
)
echo.
echo ===== DONE =====
pause
