# ⚡ COMANDOS RÁPIDOS

## 🚀 Setup Inicial (Execute UMA VEZ)

```powershell
# Opção 1: Setup automático
.\setup_completo.ps1

# Opção 2: Manual
cd analises
pip install -r ../requirements.txt
python train_model.py
cd ..
npm install
```

---

## 🎯 Comandos do Dia a Dia

### Iniciar Dashboard
```powershell
cd analises
python dashboardpq.py
```
→ http://localhost:8050

### Iniciar App
```powershell
npx expo start
```

### Verificar Ambiente
```powershell
cd analises
python verificar_ambiente.py
```

### Re-treinar Modelo
```powershell
cd analises
python train_model.py
```

---

## 🔧 Troubleshooting

### "Modelo não carregado"
```powershell
cd analises
python train_model.py
```

### "Módulo não encontrado"
```powershell
pip install -r requirements.txt
```

### "WebView não carrega"
1. Dashboard rodando? → `python dashboardpq.py`
2. Instalar webview → `npm install react-native-webview`

### Limpar e reinstalar
```powershell
# Python
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# Node
rm -rf node_modules
npm install
```

---

## 📂 Estrutura de Arquivos

```
analises/
├── train_model.py                    # Treinar modelo
├── dashboardpq.py                    # Dashboard
├── verificar_ambiente.py             # Verificar setup
├── music_classifier_model.pkl        # Modelo treinado
├── shap_analysis.pkl                 # Análise SHAP
└── shap_*.png                        # Gráficos SHAP

app/(tabs)/
└── homepage.tsx                      # App com WebView

Documentação:
├── README.md                         # Início
├── setup_completo.ps1               # Setup automático
└── analises/
    ├── RESUMO_EXECUTIVO.md          # Resumo
    ├── INSTRUCOES_ML.md             # Instruções
    ├── GUIA_RAPIDO.md               # Guia rápido
    └── COMANDOS.md                  # Este arquivo
```

---

## 🎓 Para Apresentar ao Professor

### 1. Mostrar Treinamento
```powershell
cd analises
python train_model.py
```
✓ Mostra tuning, métricas e gera SHAP

### 2. Mostrar Dashboard
```powershell
python dashboardpq.py
```
✓ Navegar até "CLASSIFICAÇÃO & SHAP"
✓ Classificar uma música
✓ Mostrar explicações

### 3. Mostrar no App
```powershell
cd ..
npx expo start
```
✓ Abrir homepage
✓ Expandir "Dashboard Analítico"
✓ Mostrar integração

---

## ⏱️ Tempos Estimados

- Setup inicial: 5-10 min
- Treinar modelo: 5-10 min
- Iniciar dashboard: instantâneo
- Iniciar app: 1-2 min

---

## 🎯 URLs Úteis

- Dashboard: http://localhost:8050
- Aba SHAP: http://localhost:8050 → "CLASSIFICAÇÃO & SHAP"

---

## 📝 Notas

- O modelo precisa ser treinado UMA vez
- O dashboard precisa estar rodando para o WebView funcionar
- Use dois terminais: um para dashboard, outro para app
- Os gráficos SHAP são gerados automaticamente

---

**Última atualização**: 18/11/2025
