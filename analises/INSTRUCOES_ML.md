# 📊 Instruções - Modelo de ML e Dashboard com SHAP

## ✅ Implementações Realizadas

### 1. **Tuning com GridSearch/RandomSearch** ✓
- Script completo: `train_model.py`
- RandomizedSearchCV com 20 combinações de parâmetros
- Random Forest Classifier otimizado
- Cross-validation com 3 folds

### 2. **Exportação do Modelo** ✓
- Modelo salvo em: `music_classifier_model.pkl`
- Inclui: modelo treinado, scaler, feature names, classes e parâmetros

### 3. **Explicabilidade com SHAP** ✓
Todas as visualizações implementadas:
- **Feature Importance Global**: Importância de cada feature
- **Beeswarm Plot**: Distribuição de impacto das features
- **Gráfico Multiclasse**: Importância por classe de popularidade
- **Force Plot Local**: Explicação individual de cada predição

### 4. **Dashboard Interativo** ✓
- Nova aba "CLASSIFICAÇÃO & SHAP" no dashboard
- Interface para classificar músicas
- Visualização de todas as análises SHAP
- Integrado com o modelo treinado

### 5. **Integração no App** ✓
- WebView na homepage para exibir o dashboard
- Posicionado abaixo das recomendações de álbuns
- Botão para expandir/recolher

---

## 🚀 Como Executar

### Passo 1: Instalar Dependências Python

```powershell
cd analises
pip install -r ../requirements.txt
```

### Passo 2: Treinar o Modelo

```powershell
python train_model.py
```

**Arquivos gerados:**
- `music_classifier_model.pkl` - Modelo treinado
- `shap_analysis.pkl` - Análises SHAP
- `shap_feature_importance.png`
- `shap_beeswarm.png`
- `shap_multiclass_bar.png`

### Passo 3: Executar o Dashboard

```powershell
python dashboardpq.py
```

O dashboard estará disponível em: **http://localhost:8050**

### Passo 4: Executar o App React Native

Em outro terminal:

```powershell
cd ..
npm install
npx expo start
```

---

## 📋 Estrutura dos Arquivos

```
analises/
├── train_model.py                    # Script de treinamento
├── dashboardpq.py                    # Dashboard com nova aba
├── music_classifier_model.pkl        # Modelo exportado
├── shap_analysis.pkl                 # Análises SHAP
├── shap_feature_importance.png       # Gráfico global
├── shap_beeswarm.png                 # Beeswarm plot
└── shap_multiclass_bar.png           # Gráfico multiclasse

app/(tabs)/
└── homepage.tsx                      # Homepage com WebView do dashboard
```

---

## 🎯 Recursos Implementados

### Modelo de ML
- ✅ Classificação de músicas em 3 categorias de popularidade
- ✅ Features: Danceability, Energy, Loudness, etc.
- ✅ RandomizedSearchCV com 20 iterações
- ✅ Métricas: Accuracy, Classification Report, Confusion Matrix

### SHAP (Explicabilidade)

#### **1. Feature Importance Global**
Mostra quais características são mais importantes para o modelo em geral.

#### **2. Beeswarm Plot**
Visualiza como cada feature impacta as predições, mostrando:
- Distribuição dos valores SHAP
- Relação entre valor da feature e impacto na predição

#### **3. Gráfico Multiclasse**
Importância das features separada por classe (Baixa, Média, Alta popularidade).

#### **4. Force Plot (Local)**
Explicação individualizada para cada música classificada:
- Mostra quais features empurraram a predição para uma classe específica
- Valores em vermelho aumentam a probabilidade
- Valores em azul diminuem a probabilidade

### Dashboard Interativo

#### Aba "CLASSIFICAÇÃO & SHAP"
1. **Status do Modelo**: Informações sobre o modelo carregado
2. **Classificador**: Interface para inserir características de uma música
3. **Resultado**: Predição e probabilidades por classe
4. **Force Plot**: Explicação SHAP local da predição
5. **Visualizações Globais**: Feature importance, beeswarm e multiclasse

### Integração com App
- WebView embutido na homepage
- Botão para expandir/recolher
- Sincronizado com o dashboard em localhost:8050

---

## 🧪 Como Testar

### 1. Teste do Modelo
```powershell
cd analises
python train_model.py
```
Verifique se os arquivos .pkl e .png foram gerados.

### 2. Teste do Dashboard
```powershell
python dashboardpq.py
```
Acesse http://localhost:8050 e navegue até a aba "CLASSIFICAÇÃO & SHAP".

### 3. Teste no App
```powershell
cd ..
npm install
npx expo start
```
- Abra o app
- Role até o final da homepage
- Clique para expandir o "Dashboard Analítico"
- Verifique se o WebView carrega o dashboard

---

## 📊 Exemplo de Classificação

### Entrada (Features):
- Danceability: 0.7
- Energy: 0.8
- Valence: 0.6
- Tempo: 128 BPM
- (outras features...)

### Saída:
- **Predição**: Alta
- **Probabilidades**: 
  - Baixa: 15%
  - Média: 25%
  - Alta: 60%

### Explicação SHAP:
O Force Plot mostrará quais features contribuíram mais para essa classificação.

---

## 🔧 Configurações

### Modelo
- **Algoritmo**: Random Forest
- **Tuning**: RandomizedSearchCV
- **Parâmetros testados**: n_estimators, max_depth, min_samples_split, etc.
- **Métricas**: Accuracy, Precision, Recall, F1-Score

### Dashboard
- **Framework**: Dash + Plotly
- **Bootstrap**: dash-bootstrap-components
- **Porta**: 8050 (padrão)

### App
- **WebView**: react-native-webview
- **URL**: http://localhost:8050
- **Posição**: Abaixo das recomendações

---

## ⚠️ Troubleshooting

### Modelo não carrega no dashboard
**Solução**: Execute `python train_model.py` primeiro.

### WebView não carrega no app
**Soluções**:
1. Certifique-se de que o dashboard está rodando: `python dashboardpq.py`
2. Verifique se está usando http://localhost:8050
3. No Android, pode ser necessário usar http://10.0.2.2:8050
4. Instale a dependência: `npm install react-native-webview`

### Erro "SHAP não disponível"
**Solução**: Execute o treinamento completo para gerar `shap_analysis.pkl`.

---

## 📚 Dependências Adicionadas

### Python (requirements.txt)
```
scikit-learn>=1.3.0
joblib>=1.3.0
shap>=0.42.0
```

### React Native (package.json)
```json
"react-native-webview": "^15.0.2"
```

---

## ✨ Próximos Passos (Opcionais)

1. **Melhorar o modelo**: Adicionar mais features, testar outros algoritmos
2. **Deploy do dashboard**: Usar Heroku, Railway ou Render
3. **Notificações**: Alertas quando classificação atinge certa confiança
4. **Histórico**: Salvar classificações realizadas
5. **Comparação**: Comparar múltiplas músicas lado a lado

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique os logs do terminal
2. Confirme que todos os arquivos .pkl foram gerados
3. Teste o dashboard isoladamente antes de integrar no app

---

**Status**: ✅ Todas as exigências do professor foram implementadas!

- ✅ Tuning (RandomizedSearchCV)
- ✅ Modelo exportado (.pkl)
- ✅ Tela de classificação no dashboard
- ✅ SHAP completo (global e local)
- ✅ Integração com o app (WebView na homepage)
