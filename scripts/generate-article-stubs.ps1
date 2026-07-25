# Generates article stub HTML from articles-base.json + UTF-8 template
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding $false
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$jsonPath = Join-Path $PSScriptRoot 'articles-base.json'
$templatePath = Join-Path $PSScriptRoot 'article-stub-template.html'
$articles = [System.IO.File]::ReadAllText($jsonPath, $utf8) | ConvertFrom-Json
$template = [System.IO.File]::ReadAllText($templatePath, $utf8)

function Esc([string]$s) {
    if ($null -eq $s) { return '' }
    return ($s -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;')
}

$created = @()
foreach ($a in $articles) {
    if ($a.existing -eq $true) { continue }

    $slug = [string]$a.slug
    $title = [string]$a.title
    $subtitle = [string]$a.subtitle
    $meta = if ($a.metaDescription) { [string]$a.metaDescription } else { $subtitle }
    $intro = [string]$a.intro
    $crumb = if ($title.Length -gt 42) { $title.Substring(0, 40) + [char]0x2026 } else { $title }

    $sectionsHtml = New-Object System.Text.StringBuilder
    foreach ($sec in $a.sections) {
        [void]$sectionsHtml.AppendLine(('                <h2>{0}</h2>' -f (Esc $sec.h2)))
        [void]$sectionsHtml.AppendLine(('                <p>{0}</p>' -f (Esc $sec.p)))
        if ($sec.bullets) {
            [void]$sectionsHtml.AppendLine('                <ul>')
            foreach ($b in $sec.bullets) {
                [void]$sectionsHtml.AppendLine(('                    <li>{0}</li>' -f (Esc $b)))
            }
            [void]$sectionsHtml.AppendLine('                </ul>')
        }
        [void]$sectionsHtml.AppendLine('')
    }

    $relatedParts = @()
    foreach ($r in $a.related) {
        $relatedParts += ('<a href="{0}">{1}</a>' -f (Esc $r.href), (Esc $r.label))
    }
    $relatedHtml = $relatedParts -join ' · '

    $html = $template.
        Replace('{{TITLE}}', (Esc $title)).
        Replace('{{META}}', (Esc $meta)).
        Replace('{{SLUG}}', $slug).
        Replace('{{CRUMB}}', (Esc $crumb)).
        Replace('{{SUBTITLE}}', (Esc $subtitle)).
        Replace('{{INTRO}}', (Esc $intro)).
        Replace('{{SECTIONS}}', $sectionsHtml.ToString()).
        Replace('{{RELATED}}', $relatedHtml)

    $out = Join-Path $root ($slug + '.html')
    [System.IO.File]::WriteAllText($out, $html, $utf8)

    $bundleDir = Join-Path $root 'deploy-bundle'
    if (Test-Path $bundleDir) {
        [System.IO.File]::WriteAllText((Join-Path $bundleDir ($slug + '.html')), $html, $utf8)
    }

    $created += $slug
}

Write-Output ('Created: ' + ($created -join ', '))
Write-Output ('Count: ' + $created.Count)
