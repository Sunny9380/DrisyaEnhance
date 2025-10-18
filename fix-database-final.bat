@echo off
echo ========================================
echo Final Database Fix
echo ========================================
echo.
echo This will fix the database schema issues:
echo 1. Column mismatches (discount_percentage, payment_reference)
echo 2. Missing table structures
echo 3. Default data insertion
echo.
pause

echo.
echo Step 1: Running schema fix...
call npm run db:schema
if %errorlevel% neq 0 (
    echo ERROR: Schema fix failed
    pause
    exit /b 1
)

echo.
echo Step 2: Testing APIs to verify fix...
call npm run test:all-apis

echo.
echo ========================================
echo Database Fix Complete!
echo ========================================
echo.
echo Check the test results above.
echo Expected improvement: Should fix the wallet transactions error.
echo.
echo Remaining issues will likely be:
echo 1. OpenAI API key (needs manual fix)
echo 2. AI enhancement endpoints (depends on API key)
echo.
echo To fix OpenAI issues:
echo 1. Get valid API key from https://platform.openai.com/account/api-keys
echo 2. Update .env file: OPENAI_API_KEY=your_new_key_here
echo 3. Restart dev server: npm run dev
echo.
pause
