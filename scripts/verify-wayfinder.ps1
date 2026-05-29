Write-Host "Wayfinder verification checks..." -ForegroundColor Cyan

git status

Write-Host "`nRunning git diff --check..." -ForegroundColor Cyan
git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed" }

Write-Host "`nChecking supabase.js syntax..." -ForegroundColor Cyan
node --check supabase.js
if ($LASTEXITCODE -ne 0) { throw "node --check supabase.js failed" }

Write-Host "`nChecking forbidden browser profile writes..." -ForegroundColor Cyan
$bad = Select-String -Path .\*.js -SimpleMatch -Pattern "profiles.insert","profiles.upsert" -ErrorAction SilentlyContinue
if ($bad) {
  $bad
  throw "Forbidden profiles.insert/profiles.upsert found"
}

Write-Host "`nChecking required auth/profile patterns..." -ForegroundColor Cyan
Select-String -Path .\supabase.js -SimpleMatch -Pattern "ensure_profile","Authorization","Bearer","authenticated read" | Format-Table -AutoSize

Write-Host "`nVerification script completed." -ForegroundColor Green
