@echo off
echo ========================================
echo Create Clean Branch Without Secrets
echo ========================================
echo.
echo This creates a new branch without any API keys in history
echo.

echo Step 1: Create new clean branch...
git checkout --orphan clean-main-dev

echo Step 2: Add all files except .env...
git add .
git reset .env

echo Step 3: Commit clean version...
git commit -m "Clean DrisyaEnhance platform without API keys"

echo Step 4: Delete old branch and rename...
git branch -D main_dev
git branch -m main_dev

echo Step 5: Push clean branch...
git push origin main_dev --force

echo.
echo ========================================
echo Clean Branch Created Successfully!
echo ========================================
echo.
echo Your repository now has no API keys in history.
echo Your local .env file is still intact.
echo.
pause
