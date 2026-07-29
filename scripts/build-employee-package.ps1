# Builds mahfazat-jeeb-employees.zip for GitHub Releases
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$src = Join-Path $repo 'simple'
$staging = Join-Path $repo 'dist-employee'
$zip = Join-Path $staging 'mahfazat-jeeb-employees.zip'

if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

$items = @(
    'index.html', 'templates-thumbs.js', 'templates-manifest.js', 'templates-base64.js',
    'mahfazat-jeeb-template.csv',
    'فتح-محفظة-جيب.bat', 'اقرأني-طريقة-الاستخدام.txt'
)
foreach ($f in $items) {
    $p = Join-Path $src $f
    if (Test-Path $p) { Copy-Item $p (Join-Path $staging $f) -Force }
}
foreach ($dir in @('fonts', 'templates', 'templates-data')) {
    $p = Join-Path $src $dir
    if (Test-Path $p) { Copy-Item $p (Join-Path $staging $dir) -Recurse -Force }
}

Compress-Archive -Path "$staging\*" -DestinationPath $zip -Force
Write-Host "OK: $zip ($([math]::Round((Get-Item $zip).Length/1MB,1)) MB)"
