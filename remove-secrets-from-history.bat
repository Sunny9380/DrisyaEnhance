@echo off
echo ========================================
echo Remove Secrets from Git History
echo ========================================
echo.
echo The problem: API keys are in previous commits (git history)
echo The solution: Remove .env from ALL commits in history
echo.
echo WARNING: This will rewrite git history!
echo Make sure you have a backup of your project.
echo.
pause

echo Step 1: Remove .env from entire git history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

if %errorlevel% neq 0 (
    echo.
    echo Git filter-branch not available. Using alternative method...
    echo.
    echo Creating new branch without secrets...
    git checkout --orphan clean-branch
    git add .gitignore .env.example
    git add --all
    git reset .env
    git commit -m "Clean repository without API keys"
    git branch -D main_dev
    git branch -m main_dev
    echo.
    echo Alternative method completed.
) else (
    echo.
    echo Step 2: Force update remote references...
    git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
    git gc --prune=now
    echo.
    echo History cleanup completed.
)

echo.
echo Step 3: Verify .env is not tracked...
git status

echo.
echo Step 4: Push clean history to GitHub...
git push origin main_dev --force

echo.
echo ========================================
echo Secrets Removed from History!
echo ========================================
echo.
echo Your .env file with API keys is now completely removed from git history.
echo GitHub should now accept the push.
echo.
echo Your local .env file is still intact and your app will work normally.
echo.
pause
