# 🎵 Needledrop - App de Avaliação de Músicas

Um aplicativo completo de avaliação musical com **Machine Learning** e **Dashboard Analítico**.

---

## 🚀 SETUP RÁPIDO (NOVO!)

### Opção 1: Setup Automático (Recomendado)
```powershell
.\setup_completo.ps1
```

### Opção 2: Setup Manual
```powershell
# 1. Instalar dependências Python
cd analises
pip install -r ../requirements.txt

# 2. Treinar modelo ML
python train_model.py

# 3. Voltar e instalar dependências do app
cd ..
npm install
```

---

## 📊 NOVO: Machine Learning & Dashboard

### ✅ Implementado para o professor:
1. **Tuning com RandomizedSearchCV**
2. **Modelo exportado (.pkl)**
3. **Tela de classificação no dashboard**
4. **Explicabilidade com SHAP**:
   - Feature Importance Global
   - Beeswarm Plot
   - Gráfico Multiclasse
   - Force Plot (explicação local)
5. **Dashboard integrado no app**

### 📚 Documentação Completa:
- [`analises/RESUMO_EXECUTIVO.md`](analises/RESUMO_EXECUTIVO.md) - Resumo completo
- [`analises/INSTRUCOES_ML.md`](analises/INSTRUCOES_ML.md) - Instruções detalhadas
- [`analises/GUIA_RAPIDO.md`](analises/GUIA_RAPIDO.md) - Guia rápido

---

## 🎯 Como Usar

### 1. Iniciar Dashboard
```powershell
cd analises
python dashboardpq.py
```
Acesse: http://localhost:8050

### 2. Iniciar App (em outro terminal)
```powershell
npx expo start
```

### 3. No App:
- Abra a homepage
- Role até o final
- Expanda "Dashboard Analítico"
- Use a aba "CLASSIFICAÇÃO & SHAP" para classificar músicas

---

## 🔬 Features de ML

### Classificação de Popularidade
O modelo classifica músicas em 3 categorias:
- **Baixa** popularidade
- **Média** popularidade  
- **Alta** popularidade

### Features Usadas:
- Danceability, Energy, Loudness
- Speechiness, Acousticness, Instrumentalness
- Liveness, Valence, Tempo, Duration

### Explicabilidade SHAP:
Entenda **por que** o modelo fez cada predição com visualizações interativas.

---

## 📱 Estrutura do App

```
app/
├── (tabs)/
│   ├── homepage.tsx          ← Dashboard integrado aqui
│   ├── busca.tsx
│   ├── minhas-resenhas.tsx
│   └── perfil.tsx
├── album-review.tsx
├── login.tsx
└── cadastro.tsx

analises/
├── train_model.py            ← Treinar modelo
├── dashboardpq.py            ← Dashboard com SHAP
├── verificar_ambiente.py     ← Verificar setup
└── *.pkl, *.png              ← Modelos e gráficos
```

---

## 🛠️ Tecnologias

### Frontend (App)
- React Native + Expo
- TypeScript
- React Navigation
- WebView (para dashboard)

### Backend/ML
- Python 3.x
- scikit-learn (RandomForest + GridSearch)
- SHAP (explicabilidade)
- Dash + Plotly (dashboard)
- Supabase (database)

---

## 📦 Dependências

### Python
```
scikit-learn>=1.3.0
shap>=0.42.0
dash==2.17.1
plotly==6.3.1
pandas, numpy, joblib
```

### React Native
```json
"react-native-webview": "^15.0.2"
"@supabase/supabase-js": "^2.81.1"
```

---

## ✅ Checklist de Entrega (Professor)

- [x] Tuning (RandomizedSearchCV)
- [x] Exportar modelo (.pkl)
- [x] Tela de classificação no dashboard
- [x] SHAP - Explicabilidade completa
  - [x] Feature importance global
  - [x] Barras multiclasse
  - [x] Beeswarm plot
  - [x] Force plot (local)
- [x] Dashboard exposto na homepage do app

---

## 🎓 Para Demonstrar

1. **Treinar modelo**: `python train_model.py`
2. **Iniciar dashboard**: `python dashboardpq.py`
3. **Mostrar classificação**: Aba "CLASSIFICAÇÃO & SHAP"
4. **Mostrar no app**: Homepage → Dashboard Analítico

---

## 📞 Suporte

Consulte a documentação em `analises/`:
- `RESUMO_EXECUTIVO.md`
- `INSTRUCOES_ML.md`
- `GUIA_RAPIDO.md`

---

## 🏆 Status

✅ **Implementação Completa**
- Modelo treinado com tuning
- Dashboard interativo
- Explicabilidade SHAP
- Integração no app
- Documentação completa

---

**Última atualização**: 18/11/2025  
**Desenvolvido por**: Julia Rebelo  
**Para**: Projeto de Machine Learning

---

## Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

### Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

### Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
