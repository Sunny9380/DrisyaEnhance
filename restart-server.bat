@echo off
echo ========================================
echo Restart DrisyaEnhance Server
echo ========================================
echo.
echo This will:
echo 1. Kill any processes using port 5000
echo 2. Start the server on port 5001
echo 3. Open the app in your browser
echo.

echo Step 1: Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)

echo Step 2: Killing processes on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)

echo.
echo Step 3: Starting server on port 5001...
echo Server will be available at: http://localhost:5001
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
npm run dev
