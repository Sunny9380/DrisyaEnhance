@echo off
echo ========================================
echo Complete Earrings Enhancement Process
echo ========================================
echo.
echo This will enhance your earrings with:
echo ✅ Dark elegant matte blue velvet background
echo ✅ Moody directional lighting
echo ✅ Criss-cross windowpane shadow patterns
echo ✅ Dramatic luxurious ambiance
echo ✅ Evening indoor lighting effects
echo ✅ Premium cinematic environment
echo ✅ 1080x1080px output size
echo.
echo Processing Methods:
echo 1. Dark Blue Velvet Template
echo 2. Dynamic Jewelry Enhancement
echo.

if not exist "your-earrings.jpg" (
    echo ❌ Earrings image not found!
    echo.
    echo Please save your earrings image as "your-earrings.jpg" in this folder
    echo Make sure it shows both earrings in the pair
    pause
    exit /b 1
)

echo ✅ Found earrings image: your-earrings.jpg
echo.
echo Your Enhancement Prompt:
echo "A dark, elegant matte blue velvet or suede background with soft texture,
echo under moody, directional lighting. Strong light beams cast realistic 
echo shadows in a criss-cross windowpane pattern, creating a dramatic and
echo luxurious ambiance..."
echo.
pause

echo.
echo 🚀 Starting enhancement process...
echo This will take approximately 1-2 minutes per enhancement
echo.

call npm run enhance:earrings

echo.
echo ========================================
echo Enhancement Process Complete!
echo ========================================
echo.
echo Check the results above for:
echo ✅ Success status
echo 💰 Total cost
echo ⏱️ Processing time
echo 📁 Output file locations
echo.
echo Your enhanced images are saved in:
echo c:\xampp\htdocs\DrisyaEnhance\uploads\processed\
echo.
echo You should have 2 enhanced versions:
echo 1. Dark Blue Velvet Template version
echo 2. Dynamic Jewelry Enhancement version
echo.
echo Both versions use your exact prompt specifications!
echo.
pause
