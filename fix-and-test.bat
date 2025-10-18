@echo off
echo ========================================
echo Fix Database Schema and Test APIs
echo ========================================
echo.
echo This will:
echo 1. Fix all missing database columns
echo 2. Test all APIs to verify fixes
echo.
pause

echo.
echo Step 1: Running comprehensive schema fix...
call npm run db:schema
if %errorlevel% neq 0 (
    echo ERROR: Schema fix failed
    pause
    exit /b 1
)

echo.
echo Step 2: Testing all APIs...
call npm run test:all-apis

echo.
echo ========================================
echo Results Summary
echo ========================================
echo.
echo Check the test results above.
echo.
echo Expected fixes:
echo ✅ admin_id column added (should fix wallet transactions)
echo ✅ quality column added (should fix ai-edits)
echo ✅ All other missing columns added
echo.
echo Remaining issues should only be:
echo ⚠️ OpenAI API key (needs valid key from platform.openai.com)
echo ⚠️ AI enhancement endpoints (depends on API key)
echo.
echo If wallet transactions still fail, check the console for specific error.
echo.
pause
