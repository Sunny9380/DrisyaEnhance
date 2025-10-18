@echo off
echo ========================================
echo Fix Image Format and Test AI Enhancement
echo ========================================
echo.
echo The issue: OpenAI requires PNG format and less than 4MB
echo Solution: Convert your JPG to PNG automatically
echo.

if not exist "your-earrings.jpg" (
    echo ❌ Earrings image not found!
    echo.
    echo Please save your earrings image as "your-earrings.jpg" in this folder
    pause
    exit /b 1
)

echo ✅ Found earrings image: your-earrings.jpg
echo.
echo Step 1: Converting JPG to PNG for OpenAI compatibility...
call npm run convert:image
if %errorlevel% neq 0 (
    echo ❌ Image conversion failed
    pause
    exit /b 1
)

echo.
echo Step 2: Testing AI enhancement with converted PNG...
call npm run test:earrings

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If successful, you should see:
echo ✅ Enhancement successful!
echo 📸 Original image path
echo 🎭 Enhanced image path
echo 💰 Cost information
echo.
echo The enhanced image will be saved in uploads/processed/
echo.
pause
