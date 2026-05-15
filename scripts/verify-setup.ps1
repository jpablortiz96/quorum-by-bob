#!/usr/bin/env pwsh
# Quorum Setup Verification Script
# Run: powershell -ExecutionPolicy Bypass -File scripts/verify-setup.ps1

$ErrorActionPreference = "Continue"
$allPassed = $true

function Check {
    param([string]$Label, [bool]$Passed, [string]$Detail = "")
    if ($Passed) {
        Write-Host "  [OK] $Label" -ForegroundColor Green
        if ($Detail) { Write-Host "       $Detail" -ForegroundColor DarkGray }
    } else {
        Write-Host "  [FAIL] $Label" -ForegroundColor Red
        if ($Detail) { Write-Host "       $Detail" -ForegroundColor Yellow }
        $script:allPassed = $false
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  QUORUM SETUP VERIFICATION" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ── Runtime Tools ─────────────────────────────────────────────
Write-Host "Runtime Tools" -ForegroundColor White

$nodeVersion = node --version 2>$null
$nodeOk = $nodeVersion -match "v(\d+)\." -and [int]$Matches[1] -ge 20
Check "Node.js >= 20" $nodeOk $(if ($nodeVersion) { $nodeVersion } else { "Not found" })

$npmVersion = npm --version 2>$null
Check "npm" ($null -ne $npmVersion) $(if ($npmVersion) { $npmVersion } else { "Not found" })

$gitVersion = git --version 2>$null
Check "Git" ($null -ne $gitVersion) $(if ($gitVersion) { $gitVersion } else { "Not found" })

$pythonVersion = python --version 2>$null
$pythonOk = $pythonVersion -match "Python 3\.(\d+)" -and [int]$Matches[1] -ge 11
Check "Python 3.11+" $pythonOk $(if ($pythonVersion) { $pythonVersion } else { "Not found" })

Write-Host ""

# ── Project Structure ──────────────────────────────────────────
Write-Host "Project Structure" -ForegroundColor White

$root = Split-Path -Parent $PSScriptRoot

$modeCount = (Get-ChildItem "$root\.bob\modes" -Filter "*.md" -ErrorAction SilentlyContinue).Count
Check ".bob/modes/ (7 files)" ($modeCount -eq 7) "$modeCount/7 mode files"

$cmdCount = (Get-ChildItem "$root\.bob\commands" -Filter "*.md" -ErrorAction SilentlyContinue).Count
Check ".bob/commands/ (4 files)" ($cmdCount -eq 4) "$cmdCount/4 command files"

$skillCount = (Get-ChildItem "$root\.bob\skills" -Filter "*.md" -ErrorAction SilentlyContinue).Count
Check ".bob/skills/ (4 files)" ($skillCount -eq 4) "$skillCount/4 skill files"

$ruleCount = (Get-ChildItem "$root\.bob\rules" -Filter "*.md" -ErrorAction SilentlyContinue).Count
Check ".bob/rules/ (2 files)" ($ruleCount -eq 2) "$ruleCount/2 rule files"

Check ".bob/mcp.json" (Test-Path "$root\.bob\mcp.json")
Check "AGENTS.md" (Test-Path "$root\AGENTS.md")
Check "README.md" (Test-Path "$root\README.md")
Check "LICENSE" (Test-Path "$root\LICENSE")
Check "mcp-server/src/index.ts" (Test-Path "$root\mcp-server\src\index.ts")
Check "mcp-server/package.json" (Test-Path "$root\mcp-server\package.json")

Write-Host ""

# ── MCP Server Build ───────────────────────────────────────────
Write-Host "MCP Server" -ForegroundColor White

$distExists = Test-Path "$root\mcp-server\dist\index.js"
Check "mcp-server/dist/index.js (built)" $distExists "Run: cd mcp-server; npm install; npm run build"

$nodeModulesExist = Test-Path "$root\mcp-server\node_modules"
Check "mcp-server/node_modules (installed)" $nodeModulesExist "Run: cd mcp-server; npm install"

Write-Host ""

# ── Demo Repository ────────────────────────────────────────────
Write-Host "Demo Repository" -ForegroundColor White

$galaxiumPath = "$root\demo-repo\galaxium-travels"
$galaxiumExists = Test-Path $galaxiumPath
Check "demo-repo/galaxium-travels cloned" $galaxiumExists "Run: .\scripts\clone-demo-repo.ps1"

if ($galaxiumExists) {
    $isGitRepo = Test-Path "$galaxiumPath\.git"
    Check "demo-repo is a git repository" $isGitRepo

    $fileCount = (Get-ChildItem $galaxiumPath -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\\." }).Count
    Check "demo-repo has files" ($fileCount -gt 10) "$fileCount files found"
}

Write-Host ""

# ── bob_sessions/ ──────────────────────────────────────────────
Write-Host "Submission Artifacts" -ForegroundColor White

Check "bob_sessions/ exists" (Test-Path "$root\bob_sessions")
Check "bob_sessions/screenshots/ exists" (Test-Path "$root\bob_sessions\screenshots")
Check "bob_sessions/exports/ exists" (Test-Path "$root\bob_sessions\exports")
Check "bob_sessions/README.md" (Test-Path "$root\bob_sessions\README.md")

Write-Host ""

# ── Git Status ─────────────────────────────────────────────────
Write-Host "Git Repository" -ForegroundColor White

$remoteUrl = git -C $root remote get-url origin 2>$null
Check "Remote origin configured" ($null -ne $remoteUrl) $(if ($remoteUrl) { $remoteUrl } else { "No remote" })

Write-Host ""

# ── Summary ────────────────────────────────────────────────────
Write-Host "======================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  ALL CHECKS PASSED -- Ready to go!" -ForegroundColor Green
} else {
    Write-Host "  SOME CHECKS FAILED -- See above." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Quick fixes:" -ForegroundColor Yellow
    Write-Host "    npm deps:    cd mcp-server; npm install; npm run build" -ForegroundColor Yellow
    Write-Host "    demo repo:   .\scripts\clone-demo-repo.ps1" -ForegroundColor Yellow
}
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
