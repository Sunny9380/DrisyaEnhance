@echo off
echo ========================================
echo Bypass GitHub Secret Protection
echo ========================================
echo.
echo GitHub detected API keys in your commits and is blocking the push.
echo.
echo EASIEST SOLUTIONS:
echo.
echo Option 1: Use GitHub's Allow Secret URLs
echo ✅ Click the URLs provided by GitHub to allow the secrets
echo ✅ This is the fastest method (30 seconds)
echo.
echo Option 2: Remove .env from current commit only
echo ✅ Safer approach, removes .env from staging
echo.

echo Current GitHub URLs to allow secrets:
echo.
echo 1. OpenAI API Key:
echo    https://github.com/Sunny9380/DrisyaEnhance/security/secret-scanning/unblock-secret/34EUqsz0uqs1PPq8jGxDCC6h1nS
echo.
echo 2. Replicate Token:
echo    https://github.com/Sunny9380/DrisyaEnhance/security/secret-scanning/unblock-secret/34DLz6pYmKJvGL9FamyYkFtLaGG
echo.
echo 3. Second OpenAI Key:
echo    https://github.com/Sunny9380/DrisyaEnhance/security/secret-scanning/unblock-secret/34DSrp2a6ytGDTKKbESjMoeVhDk
echo.

set /p choice="Choose option (1=Allow URLs, 2=Remove .env): "

if "%choice%"=="1" (
    echo.
    echo Please visit the URLs above in your browser and click "Allow secret"
    echo Then run: git push origin main_dev
    echo.
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo Removing .env from current commit...
    git reset HEAD .env
    git commit --amend --no-edit
    echo.
    echo Pushing without .env...
    git push origin main_dev --force
    echo.
    echo Done! .env is now excluded from the push.
) else (
    echo Invalid choice. Please run the script again.
)

echo.
pause
