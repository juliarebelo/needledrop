# Script de Setup Completo
# Execute: .\setup_completo.ps1

Write-Host "============================================================"
Write-Host "SETUP AUTOMATICO - ML & DASHBOARD"
Write-Host "============================================================"

# 1. Verificar diretorio
Write-Host "`n[1/5] Verificando diretorio..."
if (-not (Test-Path "analises")) {
    Write-Host "Erro: Diretorio 'analises' nao encontrado!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Diretorio correto" -ForegroundColor Green

# 2. Instalar dependencias Python
Write-Host "`n[2/5] Instalando dependencias Python..."
Set-Location analises
pip install -r ../requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Dependencias Python instaladas" -ForegroundColor Green
} else {
    Write-Host "Erro ao instalar dependencias Python" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# 3. Verificar ambiente
Write-Host "`n[3/5] Verificando ambiente..."
python verificar_ambiente.py

# 4. Treinar modelo
if (-not (Test-Path "music_classifier_model.pkl")) {
    Write-Host "`n[4/5] Modelo nao encontrado." -ForegroundColor Yellow
    Write-Host "Deseja treinar agora? (Tempo: 5-10 min)" -ForegroundColor Yellow
    $resposta = Read-Host "Digite s ou n"
    
    if (($resposta -eq "s") -or ($resposta -eq "S")) {
        Write-Host "Treinando modelo..." -ForegroundColor Cyan
        python train_model.py
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK: Modelo treinado!" -ForegroundColor Green
        } else {
            Write-Host "Erro no treinamento" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
    } else {
        Write-Host "Treinamento pulado" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[4/5] OK: Modelo ja existe" -ForegroundColor Green
}

# 5. Instalar dependencias Node
Write-Host "`n[5/5] Instalando dependencias do app..."
Set-Location ..
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Dependencias do app instaladas" -ForegroundColor Green
} else {
    Write-Host "Aviso: Verifique npm" -ForegroundColor Yellow
}

# Fim
Write-Host "`n============================================================"
Write-Host "SETUP COMPLETO!" -ForegroundColor Green
Write-Host "============================================================"

Write-Host "`nPROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. cd analises && python dashboardpq.py"
Write-Host "2. Em outro terminal: npx expo start"
Write-Host "3. Dashboard: http://localhost:8050"
Write-Host "`nDocumentacao: analises/INDEX.md"
Write-Host "Pronto para apresentacao!" -ForegroundColor Green
