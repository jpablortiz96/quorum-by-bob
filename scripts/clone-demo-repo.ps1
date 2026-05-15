#!/usr/bin/env pwsh
# Clone the IBM Galaxium Travels demo repository for Quorum analysis
# Run: powershell -ExecutionPolicy Bypass -File scripts/clone-demo-repo.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$demoDir = "$root\demo-repo"
$targetDir = "$demoDir\galaxium-travels"
$repoUrl = "https://github.com/IBM/galaxium-travels.git"
$branch = "bob-learning-path-branch"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Cloning Galaxium Travels Demo Repo" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Source: $repoUrl" -ForegroundColor Gray
Write-Host "  Branch: $branch" -ForegroundColor Gray
Write-Host "  Target: $targetDir" -ForegroundColor Gray
Write-Host ""

if (Test-Path $targetDir) {
    Write-Host "  Repository already exists at $targetDir" -ForegroundColor Yellow
    $answer = Read-Host "  Pull latest changes? (y/N)"
    if ($answer -eq "y" -or $answer -eq "Y") {
        Write-Host "  Pulling latest..." -ForegroundColor Cyan
        git -C $targetDir fetch origin
        git -C $targetDir checkout $branch
        git -C $targetDir pull origin $branch
        Write-Host "  [OK] Repository updated." -ForegroundColor Green
    } else {
        Write-Host "  Skipping. Existing repository unchanged." -ForegroundColor Gray
    }
    exit 0
}

if (-not (Test-Path $demoDir)) {
    New-Item -ItemType Directory -Force -Path $demoDir | Out-Null
}

Write-Host "  Cloning (this may take a moment)..." -ForegroundColor Cyan

try {
    git clone --branch $branch --depth 1 $repoUrl $targetDir
    Write-Host ""
    Write-Host "  [OK] Repository cloned successfully." -ForegroundColor Green

    $fileCount = (Get-ChildItem $targetDir -Recurse -File |
        Where-Object { $_.FullName -notmatch "\\\.git\\" }).Count
    Write-Host "  Files cloned: $fileCount" -ForegroundColor Gray

    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor White
    Write-Host "    1. Build MCP server: cd mcp-server; npm install; npm run build" -ForegroundColor Gray
    Write-Host "    2. Verify setup:     .\scripts\verify-setup.ps1" -ForegroundColor Gray
    Write-Host "    3. Open Bob IDE:     File -> Open Folder -> quorum-by-bob" -ForegroundColor Gray
    Write-Host "    4. Start council:    /council [your architectural question]" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "  [FAIL] Clone failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Troubleshooting:" -ForegroundColor Yellow
    Write-Host "    - Check internet connection" -ForegroundColor Yellow
    Write-Host "    - Verify the branch exists: git ls-remote --heads $repoUrl" -ForegroundColor Yellow
    Write-Host "    - Try: git clone $repoUrl $targetDir" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Done!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
