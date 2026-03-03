@echo off
echo ==========================================
echo  CareSync Azure Deployment
echo ==========================================
echo.

REM Set variables
set APP_NAME=caresync-%RANDOM%
set RESOURCE_GROUP=rg-caresync
set LOCATION=centralus
set AZURE_CLI="C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

echo App Name: %APP_NAME%
echo Resource Group: %RESOURCE_GROUP%
echo Location: %LOCATION%
echo.

REM Check Azure login
echo Checking Azure login...
%AZURE_CLI% account show >nul 2>&1
if errorlevel 1 (
    echo Please login to Azure first:
    %AZURE_CLI% login
)

REM Create resource group
echo Creating Resource Group...
%AZURE_CLI% group create --name %RESOURCE_GROUP% --location %LOCATION% --output none

REM Create App Service Plan
echo Creating App Service Plan...
%AZURE_CLI% appservice plan create --name %APP_NAME%-plan --resource-group %RESOURCE_GROUP% --sku B1 --is-linux --output none

REM Create Web App
echo Creating Web App...
%AZURE_CLI% webapp create --name %APP_NAME% --resource-group %RESOURCE_GROUP% --plan %APP_NAME%-plan --runtime "NODE|18-lts" --output none

REM Configure app settings
echo Configuring App Settings...
%AZURE_CLI% webapp config appsettings set --name %APP_NAME% --resource-group %RESOURCE_GROUP% --settings PORT=8080 JWT_SECRET=caresync_secret_key_2025 STRIPE_SECRET_KEY=sk_test_placeholder NODE_ENV=production WEBSITE_NODE_DEFAULT_VERSION=18.x SCM_DO_BUILD_DURING_DEPLOYMENT=true --output none

REM Deploy from zip
echo Deploying application...
%AZURE_CLI% webapp deploy --name %APP_NAME% --resource-group %RESOURCE_GROUP% --src-path deploy.zip --type zip --output none

echo.
echo ==========================================
echo  Deployment Complete!
echo ==========================================
echo.
echo Your app is live at: https://%APP_NAME%.azurewebsites.net
echo.
echo Demo Credentials:
echo   Patient: Register a new account
echo   Doctor: rajesh@medibook.com / doctor123
echo   Admin: admin / admin123
echo.
pause
