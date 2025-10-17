@echo off
echo 🔧 Database Fix Test Script
echo ========================

echo.
echo 📋 Step 1: Running Database Fix Script
node fix-database.js

echo.
echo 📋 Step 2: Testing New Drizzle Configuration
echo Attempting db:push with new config...
npm run db:push

echo.
echo 📋 Step 3: Testing Application Build
echo Building application...
npm run build

echo.
echo 📋 Step 4: Results Summary
echo ========================
echo If all steps passed:
echo ✅ Database is ready
echo ✅ Application builds successfully
echo ✅ Ready to start the server with: npm start
echo.
echo If any step failed:
echo ❌ Check the error messages above
echo ❌ Try manual database creation (see test-db-fix.md)
echo ❌ Verify XAMPP MySQL is running

pause
