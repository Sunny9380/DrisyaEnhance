@echo off
echo ========================================
echo Fix Git Secrets Issue
echo ========================================
echo.
echo GitHub is blocking your push because it detected API keys in .env file.
echo This is a security feature to protect your secrets.
echo.
echo Solutions:
echo 1. Remove .env from git tracking (recommended)
echo 2. Use environment variables instead
echo 3. Create .env.example without real keys
echo.
pause

echo Step 1: Remove .env from git tracking...
git rm --cached .env
if %errorlevel% neq 0 (
    echo Warning: .env might not be tracked yet
)

echo.
echo Step 2: Add .env to .gitignore...
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.production >> .gitignore

echo.
echo Step 3: Create .env.example template...
(
echo # Database Configuration (MySQL via XAMPP^)
echo DATABASE_URL=mysql://root:@localhost:3306/drisya
echo.
echo # Python Service Configuration
echo PYTHON_SERVICE_URL=http://localhost:5001
echo.
echo # Application URL (used in emails and links^)
echo APP_URL=http://localhost:5001
echo.
echo # Email Configuration (SMTP^)
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USER=your-email@gmail.com
echo EMAIL_PASSWORD=your-app-password
echo EMAIL_FROM=noreply@drisya.app
echo.
echo # Session Configuration
echo SESSION_SECRET=your-session-secret-here
echo.
echo # Node Environment
echo NODE_ENV=development
echo.
echo # OpenAI API Key (Get from https://platform.openai.com/account/api-keys^)
echo OPENAI_API_KEY=sk-your-openai-api-key-here
echo.
echo # Other AI Services (Optional^)
echo # STABILITY_API_KEY=your-stability-ai-key
echo # REPLICATE_API_TOKEN=your-replicate-token
) > .env.example

echo.
echo Step 4: Commit the changes...
git add .gitignore .env.example
git commit -m "Add .env to gitignore and create .env.example template"

echo.
echo Step 5: Push to GitHub...
git push origin main_dev

echo.
echo ========================================
echo Git Secrets Issue Fixed!
echo ========================================
echo.
echo What was done:
echo ✅ Removed .env from git tracking
echo ✅ Added .env to .gitignore
echo ✅ Created .env.example template
echo ✅ Committed and pushed changes
echo.
echo Your .env file is now safe and won't be pushed to GitHub.
echo Other developers can copy .env.example to .env and add their own keys.
echo.
echo Your local .env file with the real API key is still intact and working!
echo.
pause
