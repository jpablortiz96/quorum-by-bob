#!/usr/bin/env pwsh
# Diagnose demo-repo/galaxium-travels before spending Bobcoins.
# Run: powershell -ExecutionPolicy Bypass -File scripts/inspect-demo-repo.ps1

$ErrorActionPreference = "Continue"

$root      = Split-Path -Parent $PSScriptRoot
$repoPath  = "$root\demo-repo\galaxium-travels"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  GALAXIUM TRAVELS — REPO INSPECTION" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$repoPath\.git")) {
    Write-Host "  [FAIL] Not a git repository: $repoPath" -ForegroundColor Red
    Write-Host "  Run: .\scripts\clone-demo-repo.ps1" -ForegroundColor Yellow
    exit 1
}

# ── Shallow clone check ───────────────────────────────────────
$isShallow = Test-Path "$repoPath\.git\shallow"
if ($isShallow) {
    Write-Host "  [WARN] SHALLOW CLONE DETECTED — git_archaeology will fail." -ForegroundColor Red
    Write-Host "         Run: Remove-Item -Recurse -Force demo-repo\galaxium-travels" -ForegroundColor Yellow
    Write-Host "              .\scripts\clone-demo-repo.ps1" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "  [OK] Full clone (no shallow marker)" -ForegroundColor Green
}

# ── Basic stats ───────────────────────────────────────────────
Write-Host "Basic Stats" -ForegroundColor White

$totalCommits  = git -C $repoPath rev-list --count HEAD 2>$null
$firstCommit   = git -C $repoPath log --reverse --format="%ci | %s" 2>$null | Select-Object -First 1
$lastCommit    = git -C $repoPath log -1 --format="%ci | %s" 2>$null
$activeBranch  = git -C $repoPath rev-parse --abbrev-ref HEAD 2>$null
$allBranches   = git -C $repoPath branch -a 2>$null

Write-Host "  Total commits (HEAD branch) : $totalCommits"
Write-Host "  Active branch               : $activeBranch"
Write-Host "  First commit                : $firstCommit"
Write-Host "  Last commit                 : $lastCommit"
Write-Host ""
Write-Host "  All branches:"
$allBranches | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
Write-Host ""

# ── Keyword frequency in commit messages ─────────────────────
Write-Host "Commit Keyword Frequency (in message)" -ForegroundColor White
$keywords = @("booking", "flight", "user", "validation", "auth", "refactor", "fix", "TODO", "deprecate", "migrate", "revert", "test", "error", "service")

$allMessages = git -C $repoPath log --all --format="%s" 2>$null

$keywordStats = @()
foreach ($kw in $keywords) {
    $count = ($allMessages | Select-String -Pattern $kw -CaseSensitive:$false).Count
    $keywordStats += [PSCustomObject]@{ Keyword = $kw; Commits = $count }
}

$keywordStats | Sort-Object Commits -Descending | Format-Table -AutoSize
Write-Host ""

# ── Most-modified files (all time, across all branches) ──────
Write-Host "Top 15 Most-Modified Files (all history)" -ForegroundColor White

$allFiles = git -C $repoPath log --all --name-only --pretty=format: 2>$null |
    Where-Object { $_ -and $_.Trim() -ne "" } |
    Group-Object |
    Sort-Object Count -Descending |
    Select-Object -First 15

$allFiles | ForEach-Object {
    Write-Host ("  {0,4}x  {1}" -f $_.Count, $_.Name) -ForegroundColor Gray
}
Write-Host ""

# ── Most-modified files (last 90 days) ───────────────────────
Write-Host "Top 10 Most-Modified Files (last 90 days)" -ForegroundColor White

$since90 = (Get-Date).AddDays(-90).ToString("yyyy-MM-dd")
$recentFiles = git -C $repoPath log --all --since=$since90 --name-only --pretty=format: 2>$null |
    Where-Object { $_ -and $_.Trim() -ne "" } |
    Group-Object |
    Sort-Object Count -Descending |
    Select-Object -First 10

if ($recentFiles) {
    $recentFiles | ForEach-Object {
        Write-Host ("  {0,4}x  {1}" -f $_.Count, $_.Name) -ForegroundColor Gray
    }
} else {
    Write-Host "  (no commits in last 90 days)" -ForegroundColor DarkGray
}
Write-Host ""

# ── Commit count per branch ────────────────────────────────────
Write-Host "Commits per Remote Branch" -ForegroundColor White

$remoteBranches = git -C $repoPath branch -r 2>$null | Where-Object { $_ -notmatch "HEAD" }
foreach ($branch in $remoteBranches) {
    $b = $branch.Trim()
    $count = git -C $repoPath rev-list --count $b 2>$null
    Write-Host ("  {0,5} commits  {1}" -f $count, $b) -ForegroundColor Gray
}
Write-Host ""

# ── Summary for Council ───────────────────────────────────────
Write-Host "======================================" -ForegroundColor Cyan
if ([int]$totalCommits -ge 10) {
    Write-Host "  RICH HISTORY — Ready for Quorum Council" -ForegroundColor Green
    Write-Host "  The Historian has enough evidence to work with." -ForegroundColor Green
} elseif ([int]$totalCommits -gt 1) {
    Write-Host "  THIN HISTORY ($totalCommits commits) — Limited archaeology" -ForegroundColor Yellow
    Write-Host "  Consider --no-single-branch clone to access more branches." -ForegroundColor Yellow
} else {
    Write-Host "  SHALLOW/EMPTY — Re-clone required" -ForegroundColor Red
    Write-Host "  Run: Remove-Item -Recurse -Force demo-repo\galaxium-travels" -ForegroundColor Yellow
    Write-Host "       .\scripts\clone-demo-repo.ps1" -ForegroundColor Yellow
}
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
