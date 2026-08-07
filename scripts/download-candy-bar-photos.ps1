# Download real candy/protein bar photos -> images/products/{slug}.jpg (+ deploy-bundle)
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root 'images\products'))) {
    $root = 'C:\Users\Administrator xD\Desktop\probystronyxd'
}
$outDir = Join-Path $root 'images\products'
$bundleDir = Join-Path $root 'deploy-bundle\images\products'
New-Item -ItemType Directory -Force -Path $outDir, $bundleDir | Out-Null
$UA = 'Proteiner/1.0 (nutrition education; contact: dominikchw1@gmail.com)'

$items = @()
$items += @{ Name='Go On Protein Bar'; Slug='go-on-protein-bar'; Url=''; Queries=@('Go On protein bar','protein bar chocolate wrapper') }
$items += @{ Name='Duplo'; Slug='duplo'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Duplo_Ferrero.jpg/960px-Duplo_Ferrero.jpg'; Queries=@() }
$items += @{ Name='Lion'; Slug='lion'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Lion-Bar-Split.jpg/960px-Lion-Bar-Split.jpg'; Queries=@() }
$items += @{ Name='Pawelek'; Slug='pawelek'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/2023_Baton_Pawe%C5%82ek_%282%29.jpg/960px-2023_Baton_Pawe%C5%82ek_%282%29.jpg'; Queries=@() }
$items += @{ Name='Kinder Maxi King'; Slug='kinder-maxi-king'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Palacsinta_Palota%2C_kinder_maxi_king.jpg/960px-Palacsinta_Palota%2C_kinder_maxi_king.jpg'; Queries=@('Kinder Maxi King chocolate') }
$items += @{ Name='Toblerone'; Slug='toblerone'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Toblerone.jpg/960px-Toblerone.jpg'; Queries=@() }
$items += @{ Name='Twix'; Slug='twix'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Twix-broken.jpg/960px-Twix-broken.jpg'; Queries=@() }
$items += @{ Name='Bounty'; Slug='bounty'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bounty-Split.jpg/960px-Bounty-Split.jpg'; Queries=@() }
$items += @{ Name='Kit Kat'; Slug='kit-kat'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kit-Kat-Split.jpg/960px-Kit-Kat-Split.jpg'; Queries=@() }
$items += @{ Name='Snickers'; Slug='baton-np-snickers'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Snickers-broken.JPG/960px-Snickers-broken.JPG'; Queries=@() }
$items += @{ Name='Kinder Bueno'; Slug='kinder-bueno'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Kinder-Bueno-Split.jpg/960px-Kinder-Bueno-Split.jpg'; Queries=@() }
$items += @{ Name='Prince Polo'; Slug='prince-polo'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Prince-Polo-Dark-Split.jpg/960px-Prince-Polo-Dark-Split.jpg'; Queries=@() }
$items += @{ Name='Danusia'; Slug='danusia'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/2023_Baton_Danusia_Klasyczna.jpg/960px-2023_Baton_Danusia_Klasyczna.jpg'; Queries=@() }
$items += @{ Name='3 Bit'; Slug='3-bit'; Url='https://upload.wikimedia.org/wikipedia/commons/3/3d/3bit_fiore.jpg'; Queries=@('3 Bit chocolate wafer') }
$items += @{ Name='KitKat Chunky'; Slug='kitkat-chunky'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/KitKat.jpg/960px-KitKat.jpg'; Queries=@() }
$items += @{ Name='Bounty Dark'; Slug='bounty-dark'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bounty-Split.jpg/960px-Bounty-Split.jpg'; Queries=@() }
$items += @{ Name='Nestle Crunch'; Slug='nestle-crunch'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Nestl%C3%A9_Crunch.jpg/960px-Nestl%C3%A9_Crunch.jpg'; Queries=@() }
$items += @{ Name='Princessa'; Slug='princessa'; Url=''; Queries=@('Princessa wafer chocolate','Princessa baton') }
$items += @{ Name='Twix White'; Slug='twix-white'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Twix_white_split_%286902053171%29.jpg/960px-Twix_white_split_%286902053171%29.jpg'; Queries=@() }
$items += @{ Name='Snickers White'; Slug='snickers-white'; Url=''; Queries=@('Snickers White chocolate bar') }
$items += @{ Name='Grzeski'; Slug='grzeski'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/2023_Wafel_Grze%C5%9Bki_w_czekoladzie.jpg/960px-2023_Wafel_Grze%C5%9Bki_w_czekoladzie.jpg'; Queries=@() }
$items += @{ Name='Lion White'; Slug='lion-white'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Lion-Bar-White-Choc-Split.jpg/960px-Lion-Bar-White-Choc-Split.jpg'; Queries=@() }
$items += @{ Name='Kinder Country'; Slug='kinder-country'; Url='https://upload.wikimedia.org/wikipedia/commons/f/f6/Kinder_Country.jpg'; Queries=@() }
$items += @{ Name='Corny Big'; Slug='corny-big'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Corny.jpg/960px-Corny.jpg'; Queries=@() }
$items += @{ Name='Nuts'; Slug='nuts'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nuts_chocolate_bar_01.jpg/960px-Nuts_chocolate_bar_01.jpg'; Queries=@() }
$items += @{ Name='Knoppers'; Slug='knoppers'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/2023_Knoppers_%282%29.jpg/960px-2023_Knoppers_%282%29.jpg'; Queries=@() }
$items += @{ Name='Mars'; Slug='mars'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/2023_Baton_Mars_%281%29.jpg/960px-2023_Baton_Mars_%281%29.jpg'; Queries=@() }
$items += @{ Name='Milky Way'; Slug='milky-way'; Url='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Milky-Way-Bars-USUK-Whole.jpg/960px-Milky-Way-Bars-USUK-Whole.jpg'; Queries=@() }

function Find-CommonsUrl([string]$query) {
  $uri = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    [uri]::EscapeDataString("filetype:bitmap $query") +
    '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*'
  try {
    $resp = Invoke-RestMethod -Uri $uri -Headers @{ 'User-Agent' = $UA } -TimeoutSec 30
  } catch { return $null }
  if (-not $resp.query.pages) { return $null }
  foreach ($page in $resp.query.pages.PSObject.Properties.Value) {
    $title = [string]$page.title
    if ($title -match 'logo|icon|diagram|map|flag|coat|symbol|chart|Viola|Nintendo|Fashion-shoes|willa|Panthera|Namibia|brooch|Warrior|Eagle') { continue }
    if (-not $page.imageinfo) { continue }
    $url = $page.imageinfo[0].thumburl
    if (-not $url) { $url = $page.imageinfo[0].url }
    if ($url -and ($url -match '\.(jpg|jpeg|png|webp)')) { return $url }
  }
  return $null
}

function Find-OpenverseUrl([string]$query) {
  $uri = 'https://api.openverse.engineering/v1/images/?q=' + [uri]::EscapeDataString($query) +
    '&page_size=8&license_type=commercial,modification&extension=jpg,jpeg,png,webp'
  try {
    $resp = Invoke-RestMethod -Uri $uri -Headers @{ 'User-Agent' = $UA } -TimeoutSec 30
  } catch { return $null }
  foreach ($hit in $resp.results) {
    $url = $hit.url
    if (-not $url) { $url = $hit.thumbnail }
    $title = [string]$hit.title
    if ($url -and ($title -notmatch 'logo|icon|diagram|map|flag')) { return $url }
  }
  return $null
}

function Ensure-JpgHtml([string]$slug) {
  $paths = @(
    (Join-Path $root ("produkty\" + $slug + '.html')),
    (Join-Path $root ("deploy-bundle\produkty\" + $slug + '.html'))
  )
  $jpgRel = '../images/products/' + $slug + '.jpg'
  $fallback = 'onerror="this.onerror=null;this.src=''../images/products/' + $slug + '.webp'';this.onerror=function(){this.onerror=null;this.src=''../images/products/placeholder.svg'';};"'
  foreach ($htmlPath in $paths) {
    if (-not (Test-Path $htmlPath)) { continue }
    $html = [System.IO.File]::ReadAllText($htmlPath)
    $orig = $html
    # Primary img src: force .jpg (not png/webp as primary)
    $html = [regex]::Replace($html, 'src="\.\./images/products/' + [regex]::Escape($slug) + '\.(?:png|webp)"', 'src="' + $jpgRel + '"')
    $html = [regex]::Replace($html, "src='\.\./images/products/" + [regex]::Escape($slug) + "\.(?:png|webp)'", "src='" + $jpgRel + "'")
    $html = [regex]::Replace($html, 'content="https://proteiner\.pl/images/products/' + [regex]::Escape($slug) + '\.(?:png|webp)"', 'content="https://proteiner.pl/images/products/' + $slug + '.jpg"')
    # Normalize onerror chain to jpg primary already set; webp then placeholder
    if ($html.Contains($jpgRel)) {
      $html = [regex]::Replace($html, 'onerror="[^"]*"', $fallback)
    }
    if ($html -ne $orig) {
      [System.IO.File]::WriteAllText($htmlPath, $html)
    }
  }
}

$report = New-Object System.Collections.Generic.List[object]
foreach ($item in $items) {
  $url = $item.Url
  $source = 'curated-wikimedia'
  if ([string]::IsNullOrWhiteSpace($url)) {
    $source = $null
    $url = $null
    foreach ($q in $item.Queries) {
      $url = Find-CommonsUrl $q
      if ($url) { $source = 'commons-search'; break }
      Start-Sleep -Milliseconds 120
      $url = Find-OpenverseUrl $q
      if ($url) { $source = 'openverse'; break }
      Start-Sleep -Milliseconds 120
    }
  }
  $outPath = Join-Path $outDir ($item.Slug + '.jpg')
  $bundlePath = Join-Path $bundleDir ($item.Slug + '.jpg')
  if (-not $url) {
    Write-Host ("FAIL " + $item.Slug + ": no URL")
    $report.Add([pscustomobject]@{ Name=$item.Name; Slug=$item.Slug; Url=''; Source=''; Status='fail-no-url' })
    continue
  }
  try {
    $tmp = $outPath + '.download'
    Invoke-WebRequest -Uri $url -OutFile $tmp -Headers @{ 'User-Agent' = $UA } -TimeoutSec 60 -UseBasicParsing
    Move-Item -Force $tmp $outPath
    Copy-Item -Force $outPath $bundlePath
    Ensure-JpgHtml $item.Slug
    $size = (Get-Item $outPath).Length
    if ($size -lt 2000) { throw ("file too small: " + $size) }
    Write-Host ("OK " + $item.Slug + " (" + $size + ") <- " + $source)
    $report.Add([pscustomobject]@{ Name=$item.Name; Slug=$item.Slug; Url=$url; Source=$source; Status='success' })
  } catch {
    Write-Host ("FAIL " + $item.Slug + ": " + $_.Exception.Message)
    $report.Add([pscustomobject]@{ Name=$item.Name; Slug=$item.Slug; Url=[string]$url; Source=[string]$source; Status=('fail:' + $_.Exception.Message) })
  }
  Start-Sleep -Milliseconds 150
}

$reportPath = Join-Path $root 'scripts\candy-bar-photos-report.json'
($report | ConvertTo-Json -Depth 4) | Set-Content -Path $reportPath -Encoding UTF8
Write-Host ""
Write-Host ("Wrote " + $reportPath)
$ok = @($report | Where-Object { $_.Status -eq 'success' }).Count
Write-Host ("Success: " + $ok + "/" + $report.Count)
