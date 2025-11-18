# 🚀 GUIA RÁPIDO - Modelo ML & Dashboard SHAP

## Ordem de Execução

### 1️⃣ Verificar Ambiente
```powershell
cd analises
python verificar_ambiente.py
```

### 2️⃣ Treinar Modelo (se necessário)
```powershell
python train_model.py
```
⏱️ Tempo estimado: 5-10 minutos

### 3️⃣ Iniciar Dashboard
```powershell
python dashboardpq.py
```
🌐 Acesse: http://localhost:8050

### 4️⃣ Iniciar App (em outro terminal)
```powershell
cd ..
npm install
npx expo start
```

---

## 📱 Usando o App

1. Abra a homepage
2. Role até o final
3. Clique em "Dashboard Analítico" para expandir
4. O dashboard será exibido em um WebView

---

## 🎯 Aba "CLASSIFICAÇÃO & SHAP" no Dashboard

### Como Usar:

1. **Inserir valores** das características musicais:
   - Danceability (0-1)
   - Energy (0-1)
   - Valence (0-1)
   - Tempo (BPM)
   - etc.

2. **Clicar em "Classificar Música"**

3. **Ver resultado**:
   - Classe predita (Baixa/Média/Alta popularidade)
   - Probabilidades por classe
   - Force Plot SHAP (explicação local)

4. **Analisar explicações globais**:
   - Feature Importance
   - Beeswarm Plot
   - Gráfico Multiclasse

---

## 📊 Interpretando os Gráficos SHAP

### Feature Importance Global
**O que mostra**: Quais características são mais importantes no geral
**Como ler**: Quanto maior a barra, mais importante a feature

### Beeswarm Plot
**O que mostra**: Como cada feature impacta as predições
**Como ler**: 
- Eixo X: Impacto SHAP (positivo ou negativo)
- Cor: Valor da feature (vermelho = alto, azul = baixo)
- Dispersão: Variabilidade do impacto

### Gráfico Multiclasse
**O que mostra**: Importância separada por classe
**Como ler**: Compare a importância das features entre as 3 classes

### Force Plot (Local)
**O que mostra**: Por que o modelo fez aquela predição específica
**Como ler**:
- Vermelho: Features que aumentam a probabilidade
- Azul: Features que diminuem a probabilidade
- Tamanho: Magnitude do impacto

---

## ✅ Checklist de Entrega

Para o professor, certifique-se de que:

- [ ] Modelo treinado com RandomizedSearchCV
- [ ] Arquivo .pkl exportado
- [ ] Dashboard com aba "CLASSIFICAÇÃO & SHAP"
- [ ] Todas as visualizações SHAP funcionando:
  - [ ] Feature Importance Global
  - [ ] Beeswarm Plot
  - [ ] Gráfico Multiclasse
  - [ ] Force Plot Local
- [ ] WebView integrado no app
- [ ] Tudo rodando sem erros

---

## 🆘 Problemas Comuns

### "Modelo não carregado"
```powershell
python train_model.py
```

### "pip não reconhecido"
Use o terminal do ambiente virtual Python

### "WebView não carrega"
1. Dashboard rodando? `python dashboardpq.py`
2. URL correta? `http://localhost:8050`
3. Instalou webview? `npm install react-native-webview`

---

## 📝 Notas Importantes

- O treinamento leva alguns minutos na primeira vez
- O dashboard precisa estar rodando para o WebView funcionar
- Os gráficos SHAP são gerados automaticamente durante o treinamento
- Você pode classificar quantas músicas quiser no dashboard

---

**Última atualização**: 18/11/2025
**Status**: ✅ Pronto para apresentação!
