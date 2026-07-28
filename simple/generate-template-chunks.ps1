# Splits templates-base64.js into one file per template (lazy load, ~1-2MB each)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $scriptPath "templates-data"
$base64File = Join-Path $scriptPath "templates-base64.js"

if (-not (Test-Path $base64File)) {
    Write-Host "Run convert-templates.ps1 first."
    exit 1
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
. $base64File

foreach ($t in $templatesBase64) {
    $name = $t.name
    $js = "// $name`nwindow.__tplChunk = $($t.data | ConvertTo-Json);"
    [System.IO.File]::WriteAllText((Join-Path $outDir "$name.js"), $js, [System.Text.UTF8Encoding]::new($false))
}

Write-Host "Done: $($templatesBase64.Count) files in templates-data/"
