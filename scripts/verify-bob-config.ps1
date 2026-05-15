#!/usr/bin/env pwsh
# Quorum Bob IDE Configuration Verification Script
# Validates that .bob/ config files match the format Bob IDE expects.
# Run: powershell -ExecutionPolicy Bypass -File scripts/verify-bob-config.ps1

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

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  QUORUM BOB CONFIG VERIFICATION" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ── custom_modes.yaml ─────────────────────────────────────────
Write-Host "Custom Modes (.bob/custom_modes.yaml)" -ForegroundColor White

$modesFile = "$root\.bob\custom_modes.yaml"
Check "custom_modes.yaml exists" (Test-Path $modesFile)

if (Test-Path $modesFile) {
    $content = Get-Content $modesFile -Raw

    Check "Has 'customModes:' key" ($content -match "customModes:")

    $requiredSlugs = @("the-conservative", "the-reformer", "the-historian",
                       "the-economist", "the-risk-officer", "the-engineer", "the-judge")
    $slugCount = ($content | Select-String "- slug:" -AllMatches).Matches.Count
    Check "Has 7 mode definitions" ($slugCount -eq 7) "$slugCount/7 slug entries found"

    foreach ($slug in $requiredSlugs) {
        $found = $content -match "slug: $slug"
        Check "  slug: $slug" $found
    }

    $requiredFields = @("roleDefinition:", "whenToUse:", "customInstructions:", "groups:")
    foreach ($field in $requiredFields) {
        $fieldCount = ($content | Select-String $field -AllMatches).Matches.Count
        Check "  All modes have '$field' ($fieldCount/7)" ($fieldCount -ge 7) "$fieldCount occurrences"
    }

    $judgeEditPerm = $content -match "docs/decisions"
    Check "  Judge has docs/decisions edit permission" $judgeEditPerm
}

Write-Host ""

# ── Skills (folder format) ────────────────────────────────────
Write-Host "Skills (.bob/skills/*/SKILL.md)" -ForegroundColor White

$requiredSkills = @("council-debate", "generate-adr", "cite-evidence", "score-decision")
$skillsDir = "$root\.bob\skills"

foreach ($skill in $requiredSkills) {
    $skillDir = "$skillsDir\$skill"
    $skillFile = "$skillDir\SKILL.md"

    $dirExists = Test-Path $skillDir -PathType Container
    Check "  $skill/ directory exists" $dirExists

    if ($dirExists) {
        $fileExists = Test-Path $skillFile
        Check "  $skill/SKILL.md exists" $fileExists

        if ($fileExists) {
            $skillContent = Get-Content $skillFile -Raw
            $hasFrontmatter = $skillContent -match "^---"
            $hasName = $skillContent -match "name: $skill"
            $hasDescription = $skillContent -match "description:"
            $fmDetail = ""
        if (-not $hasFrontmatter) { $fmDetail = "Missing --- frontmatter" }
        elseif (-not $hasName)    { $fmDetail = "Missing 'name: $skill' field" }
        elseif (-not $hasDescription) { $fmDetail = "Missing description: field" }
        Check "  $skill/SKILL.md has valid frontmatter" ($hasFrontmatter -and $hasName -and $hasDescription) $fmDetail
        }
    }
}

# Check no loose .md files remain as the active skill definition
$looseSkillMds = Get-ChildItem $skillsDir -Filter "*.md" -File -ErrorAction SilentlyContinue
if ($looseSkillMds.Count -gt 0) {
    Write-Host "  [WARN] Loose .md files in .bob/skills/ root (these are inactive):" -ForegroundColor Yellow
    $looseSkillMds | ForEach-Object { Write-Host "         $($_.Name)" -ForegroundColor DarkYellow }
} else {
    Write-Host "  [OK] No loose .md files in .bob/skills/ root (clean)" -ForegroundColor Green
}

Write-Host ""

# ── Commands ──────────────────────────────────────────────────
Write-Host "Slash Commands (.bob/commands/)" -ForegroundColor White

$requiredCmds = @("council-start.md", "ask-historian.md", "verdict-only.md", "export-session.md")
$cmdsDir = "$root\.bob\commands"

foreach ($cmd in $requiredCmds) {
    $cmdPath = "$cmdsDir\$cmd"
    $exists = Test-Path $cmdPath
    Check "  $cmd exists" $exists

    if ($exists) {
        $cmdContent = Get-Content $cmdPath -Raw
        $hasName = $cmdContent -match "name:"
        $hasDescription = $cmdContent -match "description:"
        Check "  $cmd has name + description frontmatter" ($hasName -and $hasDescription)
    }
}

Write-Host ""

# ── Rules ─────────────────────────────────────────────────────
Write-Host "Rules (.bob/rules/)" -ForegroundColor White

$requiredRules = @("evidence-first.md", "bobcoin-frugal.md")
$rulesDir = "$root\.bob\rules"

foreach ($rule in $requiredRules) {
    Check "  $rule exists" (Test-Path "$rulesDir\$rule")
}

Write-Host ""

# ── MCP Config ────────────────────────────────────────────────
Write-Host "MCP Server (.bob/mcp.json)" -ForegroundColor White

$mcpFile = "$root\.bob\mcp.json"
Check "mcp.json exists" (Test-Path $mcpFile)

if (Test-Path $mcpFile) {
    $mcpContent = Get-Content $mcpFile -Raw
    Check "  Has 'quorum-tools' server" ($mcpContent -match "quorum-tools")
    Check "  Points to dist/index.js" ($mcpContent -match "dist/index.js")
    Check "  Has alwaysAllow list" ($mcpContent -match "alwaysAllow")

    $expectedTools = @("git_archaeology", "dependency_blast_radius", "module_economics", "cite_evidence", "score_dimension")
    foreach ($tool in $expectedTools) {
        Check "  Tool '$tool' in alwaysAllow" ($mcpContent -match $tool)
    }
}

Write-Host ""

# ── Summary ────────────────────────────────────────────────────
Write-Host "======================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  ALL BOB CONFIG CHECKS PASSED" -ForegroundColor Green
    Write-Host "  Bob IDE should detect all 7 modes + 4 skills." -ForegroundColor Green
    Write-Host ""
    Write-Host "  To reload Bob IDE:" -ForegroundColor White
    Write-Host "    Ctrl+Shift+P -> 'Reload Window'" -ForegroundColor Gray
    Write-Host "    Then: Settings -> Modes -> should show 7 Council modes" -ForegroundColor Gray
} else {
    Write-Host "  SOME BOB CONFIG CHECKS FAILED" -ForegroundColor Red
    Write-Host "  Fix the issues above before opening Bob IDE." -ForegroundColor Yellow
}
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
