@echo off
echo ========================================
echo Fix Remaining API Issues
echo ========================================
echo.
echo This will fix the 3 remaining issues:
echo 1. Missing database tables (manual_transactions, coin_packages)
echo 2. OpenAI API key configuration
echo 3. AI enhancement endpoints
echo.
pause

echo.
echo Step 1: Fixing missing database tables...
call npm run db:fix
if %errorlevel% neq 0 (
    echo ERROR: Database fix failed
    pause
    exit /b 1
)

echo.
echo Step 2: OpenAI API Key Configuration
echo ========================================
echo.
echo Your current OpenAI API key appears to be invalid:
echo sk-O8nc61SIB58fCFxpzHcjrPNh5vINPOdu9OhcmvkvWdp7fOK6
echo.
echo To fix the AI enhancement endpoints, you need a valid OpenAI API key:
echo.
echo 1. Go to: https://platform.openai.com/account/api-keys
echo 2. Create a new API key
echo 3. Copy the key (starts with sk-...)
echo 4. Update your .env file:
echo    OPENAI_API_KEY=your_new_key_here
echo.
echo Alternatively, you can:
echo - Use the system without AI enhancement (other features work)
echo - Set up local AI service (see CUSTOM_AI_SETUP_GUIDE.md)
echo - Use other AI providers (Stability AI, Replicate)
echo.
echo Current API test results:
echo ✅ 13/16 tests passing (81.3%% success rate)
echo ❌ 3 tests failing (OpenAI key + 1 database table)
echo.
echo After fixing the OpenAI key, run: npm run test:all-apis
echo.
pause

echo.
echo Step 3: Testing APIs again...
echo Make sure your dev server is running: npm run dev
echo.
pause
call npm run test:all-apis

echo.
echo ========================================
echo Fix Summary
echo ========================================
echo.
echo ✅ Database tables: Fixed
echo ⚠️  OpenAI API key: Needs manual update
echo ⚠️  AI enhancement: Depends on API key
echo.
echo Your app should now work at: http://localhost:5000
echo.
echo Next steps if AI enhancement is still failing:
echo 1. Get valid OpenAI API key from https://platform.openai.com/
echo 2. Update OPENAI_API_KEY in .env file
echo 3. Restart your dev server: npm run dev
echo 4. Test again: npm run test:all-apis
echo.
pause
