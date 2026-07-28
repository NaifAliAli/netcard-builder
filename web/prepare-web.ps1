# Builds web/ deploy folder from simple/ (production site)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Split-Path -Parent $root
$src = Join-Path $repo "simple"
$dst = $root

$keep = @(
    'index.html', '404.html', 'vercel.json', '.nojekyll',
    'templates-thumbs.js', 'mahfazat-jeeb-template.csv',
    'fonts', 'templates-data'
)

Get-ChildItem $dst -Force | Where-Object { $_.Name -ne 'prepare-web.ps1' -and $_.Name -ne 'README.md' } | Remove-Item -Recurse -Force

foreach ($item in $keep) {
    $from = Join-Path $src $item
    $to = Join-Path $dst $item
    if (Test-Path $from) {
        if ((Get-Item $from).PSIsContainer) { Copy-Item $from $to -Recurse -Force }
        else { Copy-Item $from $to -Force }
    }
}

Write-Host "web/ ready for deploy ($dst)"
