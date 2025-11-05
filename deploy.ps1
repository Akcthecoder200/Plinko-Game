# Plinko Lab - Vercel Deployment Script
# Run this script to deploy to Vercel

Write-Host "🎰 Plinko Lab - Vercel Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking for Vercel CLI..." -ForegroundColor Yellow
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI. Please install manually:" -ForegroundColor Red
        Write-Host "   npm install -g vercel" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

Write-Host ""

# Check if user is logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel. Please login:" -ForegroundColor Red
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
}

Write-Host ""

# Run build test
Write-Host "Testing production build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

Write-Host ""

# Prompt for environment variables
Write-Host "⚙️  Environment Variables Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$needsEnv = Read-Host "Have you set up environment variables in Vercel? (y/n)"
if ($needsEnv -eq "n") {
    Write-Host ""
    Write-Host "📝 You need to set these environment variables in Vercel:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. DATABASE_URL" -ForegroundColor White
    Write-Host "   Example: libsql://your-db.turso.io?authToken=your-token" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. SERVER_SEED_SALT (64 random hex characters)" -ForegroundColor White
    
    # Generate a random salt
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $salt = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
    
    Write-Host "   Generated for you: $salt" -ForegroundColor Gray
    Write-Host "   (Copy this and save it!)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. NODE_ENV" -ForegroundColor White
    Write-Host "   Value: production" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "To set environment variables:" -ForegroundColor Cyan
    Write-Host "  vercel env add DATABASE_URL" -ForegroundColor White
    Write-Host "  vercel env add SERVER_SEED_SALT" -ForegroundColor White
    Write-Host "  vercel env add NODE_ENV" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Set up env vars now and then press Enter to continue (or 'q' to quit)"
    if ($continue -eq "q") {
        exit 0
    }
}

Write-Host ""

# Deploy
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

$deployType = Read-Host "Deploy to production? (y/n, default: preview)"
if ($deployType -eq "y") {
    Write-Host "Deploying to PRODUCTION..." -ForegroundColor Yellow
    vercel --prod
} else {
    Write-Host "Deploying PREVIEW..." -ForegroundColor Yellow
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Post-deployment checklist:" -ForegroundColor Cyan
    Write-Host "  1. Visit your deployment URL" -ForegroundColor White
    Write-Host "  2. Test /play page - drop a ball" -ForegroundColor White
    Write-Host "  3. Test /verify page - verify a round" -ForegroundColor White
    Write-Host "  4. Check mobile responsiveness" -ForegroundColor White
    Write-Host "  5. Test sound effects" -ForegroundColor White
    Write-Host "  6. Verify history persists" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check errors above." -ForegroundColor Red
    Write-Host "See DEPLOYMENT.md for troubleshooting help." -ForegroundColor Yellow
    exit 1
}
