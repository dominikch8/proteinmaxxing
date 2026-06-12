# Lokalny podgląd strony — http://localhost:8080
Set-Location $PSScriptRoot
if (-not (Test-Path "node_modules\serve")) {
    Write-Host "Instalacja serve (pierwsze uruchomienie)..."
    npm install
}
Write-Host "Serwer: http://localhost:8080"
Write-Host "Zatrzymanie: Ctrl+C"
npm run start
