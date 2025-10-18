@echo off
echo ========================================
echo DrisyaEnhance - Fix All Issues
echo ========================================
echo.
echo This script will:
echo 1. Fix database connection issues
echo 2. Create missing database tables
echo 3. Test all API endpoints
echo 4. Generate a comprehensive report
echo.
pause

echo.
echo Step 1: Setting up database...
call npm run db:quick
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)

echo.
echo Step 2: Creating missing tables...
call npm run db:fix
if %errorlevel% neq 0 (
    echo ERROR: Database table creation failed
    pause
    exit /b 1
)

echo.
echo Step 3: Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Step 4: Testing all APIs...
echo Make sure your dev server is running in another terminal: npm run dev
echo.
pause
call npm run test:all-apis

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check the api-test-report.json file for detailed results
echo 2. Start your dev server: npm run dev
echo 3. Open http://localhost:5000 in your browser
echo.
echo If you still have issues:
echo 1. Check XAMPP is running (Apache + MySQL)
echo 2. Verify database connection at http://localhost/phpmyadmin
echo 3. Check the console logs for specific errors
echo.
pause
