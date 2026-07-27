@echo off
echo ========================================
echo  Anonymous Feedback Board - Vercel Deploy
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Vercel CLI not found. Installing...
    npm install -g vercel
    echo.
)

echo [1] Logging into Vercel...
vercel login
echo.

echo [2] Deploying to Vercel Production...
vercel --prod
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy your Vercel URL from the output above
echo 2. Update README.md with the live URL
echo 3. Add environment variables in Vercel dashboard:
echo    - VITE_NETWORK_ID = preprod
echo    - VITE_LOGGING_LEVEL = info
echo    - VITE_CONTRACT_ADDRESS = ^<your-contract-address^>
echo.
echo For detailed instructions, see VERCEL_DEPLOYMENT.md
echo.
pause
