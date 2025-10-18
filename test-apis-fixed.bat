@echo off
echo ========================================
echo Testing APIs with Fixes
echo ========================================
echo.
echo Make sure your dev server is running: npm run dev
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo Running improved API tests...
call npm run test:all-apis

echo.
echo ========================================
echo Test Results Summary
echo ========================================
echo.
echo Check the console output above for detailed results.
echo The api-test-report.json file has been updated.
echo.
echo Key things to check:
echo 1. Session cookie management
echo 2. Authentication persistence  
echo 3. AI enhancement endpoint errors
echo 4. Protected endpoint access
echo.
pause
