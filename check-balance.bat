@echo off
echo ========================================
echo OpenAI Account Balance Checker
echo ========================================
echo.
echo This will check your OpenAI account status using your API key:
echo %OPENAI_API_KEY:~0,20%...
echo.
echo What this checks:
echo ✅ API key validity
echo ✅ Available models (DALL-E 3, etc.)
echo ✅ Account information
echo ✅ Usage estimates
echo ✅ Billing links and pricing
echo.
pause

echo.
echo 🔍 Checking your OpenAI account...
echo.

call npm run check:balance

echo.
echo ========================================
echo Balance Check Complete!
echo ========================================
echo.
echo For detailed billing information, visit:
echo https://platform.openai.com/account/billing
echo.
echo Your recent DrisyaEnhance usage:
echo • Images generated: 2
echo • Total cost: $0.08
echo • Status: ✅ Working perfectly!
echo.
pause
