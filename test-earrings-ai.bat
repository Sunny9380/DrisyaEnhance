@echo off
echo ========================================
echo Test AI Enhancement with Your Earrings
echo ========================================
echo.
echo This will test your OpenAI API key with the earrings image
echo and generate an enhanced version with Dark Blue Velvet background.
echo.
echo Requirements:
echo 1. Save your earrings image as "your-earrings.jpg" in this folder
echo 2. Make sure your server is running on port 5001
echo 3. Your OpenAI API key is configured in .env
echo.

if not exist "your-earrings.jpg" (
    echo ❌ Earrings image not found!
    echo.
    echo Please:
    echo 1. Save your earrings image as "your-earrings.jpg" in this folder
    echo 2. Make sure it's a JPG/JPEG file
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Found earrings image: your-earrings.jpg
echo.
echo Testing with your prompt:
echo "A dark, elegant matte blue velvet background with moody lighting..."
echo.
pause

echo.
echo Step 1: Checking if server is running...
curl -s http://localhost:5001/api/openai/status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server not running on port 5001
    echo Please start your server first: npm run dev
    echo Then run this script again
    pause
    exit /b 1
)

echo ✅ Server is running
echo.
echo Step 2: Running AI enhancement test...
call npm run test:earrings

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Check the results above. If successful, you should see:
echo ✅ Enhanced image path
echo 💰 Cost information
echo ⏱️ Processing time
echo.
echo The enhanced image will be saved in:
echo uploads/processed/
echo.
echo Your original prompt was:
echo "A dark, elegant matte blue velvet or suede background with soft texture,
echo under moody, directional lighting with criss-cross windowpane shadows..."
echo.
pause
