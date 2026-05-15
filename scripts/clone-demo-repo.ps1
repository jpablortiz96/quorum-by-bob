#!/usr/bin/env pwsh
# Clone the IBM Galaxium Travels demo repository for Quorum analysis
# Full history clone (no --depth) required for git_archaeology MCP tool.
# Run: powershell -ExecutionPolicy Bypass -File scripts/clone-demo-repo.ps1

$ErrorActionPreference = "Stop"

$root        = Split-Path -Parent $PSScriptRoot
$demoDir     = "$root\demo-repo"
$targetDir   = "$demoDir\galaxium-travels"
$repoUrl     = "https://github.com/IBM/galaxium-travels.git"
$checkoutBranch = "bob-learning-path-branch"   # switch to this after full clone
$minCommits  = 10                               # validation threshold

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Cloning Galaxium Travels (Full History)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Source  : $repoUrl" -ForegroundColor Gray
Write-Host "  Strategy: --no-single-branch (all remote branches)" -ForegroundColor Gray
Write-Host "  Checkout: $checkoutBranch" -ForegroundColor Gray
Write-Host "  Target  : $targetDir" -ForegroundColor Gray
Write-Host ""

# ── Handle existing directory ─────────────────────────────────
if (Test-Path $targetDir) {
    $existingCount = 0
    try { $existingCount = [int](git -C $targetDir rev-list --count HEAD 2>$null) } catch {}

    Write-Host "  Existing clone found ($existingCount commits)." -ForegroundColor Yellow

    if ($existingCount -ge $minCommits) {
        Write-Host "  Already a full clone. Pulling latest changes..." -ForegroundColor Cyan
        git -C $targetDir fetch --all --prune
        git -C $targetDir checkout $checkoutBranch
        git -C $targetDir pull origin $checkoutBranch
        Write-Host "  [OK] Repository updated." -ForegroundColor Green
        $finalCount = [int](git -C $targetDir rev-list --count HEAD 2>$null)
        Write-Host "  Commits on HEAD: $finalCount" -ForegroundColor Gray
        exit 0
    }

    Write-Host "  Shallow clone detected. Removing and re-cloning..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $targetDir
    Write-Host "  [OK] Old directory removed." -ForegroundColor Green
}

if (-not (Test-Path $demoDir)) {
    New-Item -ItemType Directory -Force -Path $demoDir | Out-Null
}

# ── Full clone ────────────────────────────────────────────────
Write-Host "  Cloning full history (this takes ~1-2 minutes)..." -ForegroundColor Cyan

try {
    git clone --no-single-branch $repoUrl $targetDir
    git -C $targetDir checkout $checkoutBranch
} catch {
    Write-Host ""
    Write-Host "  [FAIL] Clone failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Troubleshooting:" -ForegroundColor Yellow
    Write-Host "    - Check internet connection" -ForegroundColor Yellow
    Write-Host "    - Verify remote: git ls-remote $repoUrl" -ForegroundColor Yellow
    exit 1
}

# ── Validation ────────────────────────────────────────────────
$commitCount = 0
try { $commitCount = [int](git -C $targetDir rev-list --count HEAD 2>$null) } catch {}

Write-Host ""
if ($commitCount -lt $minCommits) {
    Write-Host "  [FAIL] Only $commitCount commit(s) found. Expected at least $minCommits." -ForegroundColor Red
    Write-Host "  The repo may have very shallow history on $checkoutBranch." -ForegroundColor Yellow
    Write-Host "  Run inspect-demo-repo.ps1 to analyze all branches." -ForegroundColor Yellow
    exit 1
}

Write-Host "  [OK] Full clone complete." -ForegroundColor Green

$fileCount = ([System.IO.Directory]::GetFiles($targetDir, "*", [System.IO.SearchOption]::AllDirectories) |
    Where-Object { $_ -notmatch "\\.git\\" }).Count
$branchList = (git -C $targetDir branch -r 2>$null) -join ", "

Write-Host "  Commits (HEAD branch): $commitCount" -ForegroundColor Gray
Write-Host "  Files cloned         : $fileCount" -ForegroundColor Gray
Write-Host "  Remote branches      : $branchList" -ForegroundColor Gray

Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    Inspect repo:  .\scripts\inspect-demo-repo.ps1" -ForegroundColor Gray
Write-Host "    Rebuild MCP:   cd mcp-server; npm run build; cd .." -ForegroundColor Gray
Write-Host "    Reload Bob:    Ctrl+Shift+P -> Reload Window" -ForegroundColor Gray

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Done!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
