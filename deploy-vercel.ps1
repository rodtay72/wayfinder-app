# =============================================
# Way Finder - Vercel Deployment Script
# Run this from PowerShell in the wayfinder_modular folder
# Prerequisite: Node.js must be installed (https://nodejs.org)
# =============================================

Write-Host "🌐 Deploying Way Finder to Vercel..." -ForegroundColor Cyan

# Install Vercel CLI if not already installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to Vercel
Write-Host ""
Write-Host "Starting Vercel deployment..." -ForegroundColor Cyan
Write-Host "You will be prompted to log in with your Vercel account." -ForegroundColor White
Write-Host "If you don't have one, sign up free at https://vercel.com" -ForegroundColor White
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Your live URL will be shown above (e.g. https://wayfinder-app.vercel.app)" -ForegroundColor White
Write-Host ""
Write-Host "📋 To update the live site after making changes:" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor Cyan
