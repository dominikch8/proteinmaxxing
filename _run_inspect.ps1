 = @(
  'C:\Program Files\cursor\resources\app\resources\helpers\node.exe',
  'C:\Users\daniel\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe'
)
foreach ( in ) { if (Test-Path ) { Write-Output " HELPER:\ } }
Get-ChildItem 'C:\Program Files\cursor' -Recurse -Filter 'node.exe' -EA SilentlyContinue | Select-Object -First 5 -ExpandProperty FullName
Get-ChildItem 'C:\Users\daniel\AppData\Local' -Recurse -Filter 'node.exe' -Depth 5 -EA SilentlyContinue | Select-Object -First 10 -ExpandProperty FullName
Get-ChildItem 'C:\Users\daniel\AppData\Local' -Recurse -Filter 'git.exe' -Depth 6 -EA SilentlyContinue | Select-Object -First 10 -ExpandProperty FullName
Get-ChildItem 'C:\Program Files' -Recurse -Filter 'git.exe' -Depth 4 -EA SilentlyContinue | Select-Object -First 5 -ExpandProperty FullName
