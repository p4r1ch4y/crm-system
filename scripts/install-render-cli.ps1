Param(
  [string]$Version = "1.1.0"
)

$repo = "https://github.com/render-oss/cli/releases/download/v$Version"
$zipName = "cli_${Version}_windows_amd64.zip"
$zipUrl = "$repo/$zipName"
$tempZip = Join-Path $env:TEMP $zipName
$installDir = Join-Path $env:USERPROFILE "bin\render"
$exePath = Join-Path $installDir "render.exe"

Write-Host "Downloading Render CLI v$Version from $zipUrl" -ForegroundColor Cyan
Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip

if (-not (Test-Path $installDir)) { New-Item -ItemType Directory -Path $installDir | Out-Null }

Write-Host "Extracting to $installDir" -ForegroundColor Cyan
if (Test-Path $installDir) {
  try { Remove-Item -Recurse -Force -Path $installDir } catch {}
}
New-Item -ItemType Directory -Path $installDir | Out-Null
Expand-Archive -LiteralPath $tempZip -DestinationPath $installDir -Force

# The archive usually contains a versioned exe like cli_v1.1.0.exe
$foundExe = Get-ChildItem -Path $installDir -Recurse -Filter "*.exe" | Select-Object -First 1
if ($null -eq $foundExe) {
  Write-Error "Failed to find render.exe in the extracted files."
  exit 1
}

# Rename to render.exe
Rename-Item -Path $foundExe.FullName -NewName "render.exe" -Force

# Prepend to PATH for current session
$env:PATH = "$installDir;$env:PATH"

Write-Host "Render CLI installed to $exePath" -ForegroundColor Green
Write-Host "Version output:" -ForegroundColor Cyan
& $exePath --version
