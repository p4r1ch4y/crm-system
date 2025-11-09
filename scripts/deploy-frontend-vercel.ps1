Param(
  [string]$ProjectPath = "frontend",
  [string]$Token = $env:VERCEL_TOKEN,
  [switch]$Prod
)

if (-not $Token) {
  Write-Host "VERCEL_TOKEN not set. Please set it (setx VERCEL_TOKEN your_token) or pass -Token." -ForegroundColor Yellow
}

$fullPath = Resolve-Path $ProjectPath
Write-Host "Deploying Vercel project at $fullPath" -ForegroundColor Cyan

Push-Location $fullPath
try {
  if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI globally..." -ForegroundColor Cyan
    npm install -g vercel | Out-Null
  }

  Write-Host "Building Vite frontend (npm run build)..." -ForegroundColor Cyan
  npm install
  npm run build

  $flags = @('--confirm','--cwd', $fullPath)
  if ($Prod) { $flags += '--prod' }
  if ($Token) { $flags += "--token=$Token" }

  Write-Host "Running vercel deployment..." -ForegroundColor Cyan
  vercel @flags
}
finally {
  Pop-Location
}
