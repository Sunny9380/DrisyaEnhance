@echo off
echo Creating upload directories...

if not exist "uploads" mkdir uploads
if not exist "uploads\templates" mkdir uploads\templates
if not exist "uploads\avatars" mkdir uploads\avatars
if not exist "uploads\generated" mkdir uploads\generated

echo.
echo ✅ Upload directories created successfully!
echo.
echo Directory structure:
echo   uploads\
echo   ├── templates\     (for template thumbnail images)
echo   ├── avatars\       (for user profile pictures)
echo   └── generated\     (for AI-generated images)
echo.

echo Testing directory permissions...
echo test > uploads\test.txt
if exist uploads\test.txt (
    echo ✅ Write permissions OK
    del uploads\test.txt
) else (
    echo ❌ Write permissions failed
)

echo.
echo Now run: node add_jewelry_templates.js
pause
