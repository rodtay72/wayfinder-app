# =============================================
# Way Finder - GitHub Setup Script
# Run this once from PowerShell in the wayfinder_modular folder
# =============================================

Write-Host "Setting up GitHub repository for Way Finder..." -ForegroundColor Cyan

# Step 1: Initialize git repo
git init
git branch -m main

# Step 2: Set your identity
git config user.name "Rodney"
git config user.email "rodney.tay@gmail.com"

# Step 3: Create .gitignore
$gitignore = ".DS_Store`nThumbs.db`n*.log`nnode_modules/"
Set-Content -Path ".gitignore" -Value $gitignore -Encoding utf8

# Step 4: Stage and commit all files
git add .
git commit -m "Initial commit: Way Finder modular app"

Write-Host ""
Write-Host "Local git repo created with initial commit!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Go to https://github.com/new" -ForegroundColor White
Write-Host "  2. Create a new repo named: wayfinder-app" -ForegroundColor White
Write-Host "  3. Do NOT initialise with README (leave it empty)" -ForegroundColor White
Write-Host "  4. Copy the repo URL shown on the page" -ForegroundColor White
Write-Host "  5. Run these two commands with your actual URL:" -ForegroundColor White
Write-Host ""
Write-Host "  git remote add origin https://github.com/YOUR-USERNAME/wayfinder-app.git" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then share the GitHub URL with your business partner!" -ForegroundColor Green
