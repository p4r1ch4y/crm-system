Param(
  [string]$Blueprint = "render.yaml",
  [string]$DatabaseUrl,
  [string]$CorsOrigin
)

$root = Resolve-Path "."
$blueprintPath = Join-Path $root $Blueprint
if (-not (Test-Path $blueprintPath)) {
  Write-Error "Blueprint file not found: $blueprintPath"
  exit 1
}

if (-not (Get-Command render -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Render CLI globally..." -ForegroundColor Cyan
  npm install -g @renderinc/cli | Out-Null
}

Write-Host "Logging in to Render (if required)..." -ForegroundColor Cyan
render login

Write-Host "Applying Render blueprint: $blueprintPath" -ForegroundColor Cyan
render blueprint apply $blueprintPath

Write-Host "NOTE: Set required environment variables for the backend service on Render:" -ForegroundColor Yellow
Write-Host " - DATABASE_URL (Supabase connection string)" -ForegroundColor Yellow
Write-Host " - CORS_ORIGIN (your Vercel app URL)" -ForegroundColor Yellow
Write-Host " - SLACK_WEBHOOK_URL (optional)" -ForegroundColor Yellow
Write-Host "You can set these in the Render dashboard or via CLI once the service is created." -ForegroundColor Yellow
