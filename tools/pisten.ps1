# Lädt Pisten, Bike-Trails und Lifte aus OpenStreetMap (Overpass API) und speichert sie kompakt
# als data/pisten/<id>.json. Aufruf ohne Parameter erzeugt alle Gebiete aus der Liste unten.
param([string]$Only = '')

$areas = @(
  @{ id = 'arosa-lenzerheide'; type = 'ski';  bbox = '46.69,9.49,46.81,9.72' },
  @{ id = 'laax';              type = 'ski';  bbox = '46.78,9.13,46.90,9.33' },
  @{ id = 'davos-parsenn';     type = 'ski';  bbox = '46.79,9.76,46.90,9.92' },
  @{ id = 'davos-jakobshorn';  type = 'ski';  bbox = '46.75,9.80,46.81,9.88' },
  @{ id = 'klosters-madrisa';  type = 'ski';  bbox = '46.86,9.85,46.93,9.96' },
  @{ id = 'davos-rinerhorn';   type = 'ski';  bbox = '46.71,9.76,46.76,9.83' },
  @{ id = 'bike-lenzerheide';  type = 'bike'; bbox = '46.70,9.50,46.79,9.60' },
  @{ id = 'bike-arosa';        type = 'bike'; bbox = '46.75,9.62,46.81,9.72' },
  @{ id = 'bike-laax';         type = 'bike'; bbox = '46.78,9.18,46.88,9.33' },
  @{ id = 'bike-davos';        type = 'bike'; bbox = '46.75,9.76,46.90,9.92' }
)
$servers = @('https://lz4.overpass-api.de/api/interpreter', 'https://z.overpass-api.de/api/interpreter', 'https://overpass-api.de/api/interpreter')
$root = Join-Path $PSScriptRoot '..\data\pisten'
New-Item -ItemType Directory -Force -Path $root | Out-Null
$inv = [Globalization.CultureInfo]::InvariantCulture

foreach ($a in $areas) {
  if ($Only -and $a.id -ne $Only) { continue }
  $b = $a.bbox
  $sel = if ($a.type -eq 'ski') { "way[`"piste:type`"=`"downhill`"]($b);" } else { "way[`"mtb:scale`"]($b);" }
  $q = "[out:json][timeout:60];($sel way[`"aerialway`"]($b););out geom tags;"
  $json = $null
  foreach ($try in 1..6) {
    $srv = $servers[($try - 1) % $servers.Count]
    try {
      $r = Invoke-WebRequest -Uri $srv -Method Post -Body @{ data = $q } -UserAgent 'Bergtage/1.0 (private ski app)' -UseBasicParsing -TimeoutSec 90
      # Overpass schickt UTF-8 ohne Zeichensatz-Angabe; PowerShell 5.1 würde Latin-1 annehmen und Umlaute verderben
      $text = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
      if ($text.TrimStart().StartsWith('{')) { $json = $text | ConvertFrom-Json; break }
    } catch { }
    Start-Sleep -Seconds (5 * $try)
  }
  if (-not $json) { Write-Host "$($a.id): FEHLER, keine Daten"; continue }

  $out = New-Object System.Collections.Generic.List[string]
  foreach ($e in $json.elements) {
    if (-not $e.geometry) { continue }
    $t = $e.tags
    if ($t.aerialway) {
      if ($t.aerialway -in @('station', 'pylon', 'goods', 'zip_line')) { continue }
      $k = 'lift'; $d = $t.aerialway
    } elseif ($a.type -eq 'ski') {
      $k = 'piste'; $d = if ($t.'piste:difficulty') { $t.'piste:difficulty' } else { 'unknown' }
      if ($t.'piste:grooming' -eq 'backcountry' -and $d -notin @('freeride', 'extreme')) { $d = 'freeride' }
    } else {
      $k = 'trail'; $d = [string]$t.'mtb:scale'
    }
    $name = if ($t.'piste:name') { $t.'piste:name' } elseif ($t.name) { $t.name } else { '' }
    $ref = if ($t.'piste:ref') { $t.'piste:ref' } elseif ($t.ref) { $t.ref } else { '' }
    $pts = ($e.geometry | ForEach-Object { '[' + $_.lat.ToString('0.#####', $inv) + ',' + $_.lon.ToString('0.#####', $inv) + ']' }) -join ','
    $o = [ordered]@{ k = $k; d = $d; n = $name; r = $ref }
    $head = ($o | ConvertTo-Json -Compress).TrimEnd('}')
    $out.Add("$head,`"g`":[$pts]}")
  }
  $file = Join-Path $root "$($a.id).json"
  $body = "{`"v`":1,`"src`":`"OpenStreetMap`",`"at`":`"$(Get-Date -Format 'yyyy-MM-dd')`",`"bbox`":[$b],`"f`":[" + ($out -join ',') + ']}'
  [IO.File]::WriteAllText($file, $body, (New-Object Text.UTF8Encoding $false))
  Write-Host ("{0}: {1} Linien, {2:N0} KB" -f $a.id, $out.Count, ((Get-Item $file).Length / 1KB))
  Start-Sleep -Seconds 3
}
