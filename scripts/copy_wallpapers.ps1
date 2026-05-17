# Copy PC wallpapers from temp to public/wallpapers
$temp = Join-Path $env:TEMP "genshin-wallpapers-dl"
$manifest = Join-Path $temp "manifest.json"
$out = "E:\Genshin bookmark\genshin-bookmarks\public\wallpapers"

if (-not (Test-Path $manifest)) {
    Write-Host "Manifest not found at $manifest. Run download_wallpapers.py first."
    exit 1
}

$files = Get-Content $manifest -Raw | ConvertFrom-Json
$copied = 0
foreach ($file in $files) {
    $src = $file.source
    $rel = $file.relative
    $dest = Join-Path $out $rel
    $parent = Split-Path $dest -Parent
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    Copy-Item -LiteralPath $src -Destination $dest -Force
    $copied++
}

Write-Host "Copied $copied PC wallpapers to $out"
