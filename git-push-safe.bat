@echo off
echo ========================================
echo Safe Git Push (No API Keys)
echo ========================================
echo.
echo This will commit and push without exposing API keys
echo.

echo Step 1: Committing gitignore changes...
git commit -m "Add .env to gitignore - prevent API key exposure"

echo.
echo Step 2: Pushing to GitHub...
git push origin main_dev

echo.
echo ========================================
echo Push Complete!
echo ========================================
echo.
echo Your .env file with API keys is now protected and won't be pushed.
echo Other developers can use .env.example as a template.
echo.
pause
