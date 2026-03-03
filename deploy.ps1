# CareSync Azure Deployment Script
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location,
    
    [string]$AppName = "caresync-$(Get-Random -Minimum 1000 -Maximum 9999)"
)

Write-Host "🚀 Deploying CareSync to Azure..." -ForegroundColor Green
Write-Host "App Name: $AppName" -ForegroundColor Cyan
Write-Host "Location: $Location" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Cyan

# Login to Azure (if not already logged in)
$context = Get-AzContext -ErrorAction SilentlyContinue
if (-not $context) {
    Write-Host "Logging into Azure..." -ForegroundColor Yellow
    Connect-AzAccount
}

# Create Resource Group
Write-Host "Creating Resource Group..." -ForegroundColor Yellow
New-AzResourceGroup -Name $ResourceGroupName -Location $Location -Force | Out-Null

# Create App Service Plan (Basic tier for cost-effectiveness)
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
$plan = New-AzAppServicePlan `
    -ResourceGroupName $ResourceGroupName `
    -Name "$AppName-plan" `
    -Location $Location `
    -Tier Basic `
    -WorkerSize Small `
    -Linux

# Create Web App
Write-Host "Creating Web App..." -ForegroundColor Yellow
$webApp = New-AzWebApp `
    -ResourceGroupName $ResourceGroupName `
    -Name $AppName `
    -Location $Location `
    -AppServicePlan $plan.Name `
    -Runtime "node|18-lts"

# Configure App Settings
Write-Host "Configuring App Settings..." -ForegroundColor Yellow
$appSettings = @{
    "PORT" = "8080"
    "JWT_SECRET" = "caresync_secret_key_2025"
    "STRIPE_SECRET_KEY" = "sk_test_placeholder"
    "NODE_ENV" = "production"
    "WEBSITE_NODE_DEFAULT_VERSION" = "18.x"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
}

Set-AzWebApp `
    -ResourceGroupName $ResourceGroupName `
    -Name $AppName `
    -AppSettings $appSettings | Out-Null

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$deployPath = ".\deploy.zip"
if (Test-Path $deployPath) {
    Remove-Item $deployPath -Force
}

# Create zip excluding node_modules and .git
$filesToInclude = Get-ChildItem -Path "." -Exclude @("node_modules", ".git", ".qoder", "deploy.zip", ".azure")
Compress-Archive -Path $filesToInclude -DestinationPath $deployPath -Force

# Deploy to Azure
Write-Host "Deploying to Azure..." -ForegroundColor Yellow
Publish-AzWebApp `
    -ResourceGroupName $ResourceGroupName `
    -Name $AppName `
    -ArchivePath $deployPath `
    -Force

# Clean up
Remove-Item $deployPath -Force

# Output results
$siteUrl = "https://$AppName.azurewebsites.net"
Write-Host "" 
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Your app is live at: $siteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Patient: Register a new account" -ForegroundColor Gray
Write-Host "  Doctor: rajesh@medibook.com / doctor123" -ForegroundColor Gray
Write-Host "  Admin: admin / admin123" -ForegroundColor Gray
