$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$narrator = New-Object System.Speech.Synthesis.SpeechSynthesizer
$narrator.Rate = 2
$narrator.Volume = 100
$chapters = Get-Content -LiteralPath 'scripts/video-narration.json' -Raw | ConvertFrom-Json
$audioDirectory = Join-Path (Get-Location) 'artifacts/audio'
New-Item -ItemType Directory -Path $audioDirectory -Force | Out-Null
for ($chapterIndex = 0; $chapterIndex -lt $chapters.Count; $chapterIndex++) {
  $audioFile = Join-Path $audioDirectory "$chapterIndex.wav"
  $narrator.SetOutputToWaveFile($audioFile)
  $narrator.Speak($chapters[$chapterIndex].text)
  $narrator.SetOutputToNull()
}
$narrator.Dispose()
Write-Output 'Narration rendered to artifacts/audio.'
