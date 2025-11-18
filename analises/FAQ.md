# ❓ FAQ - Perguntas Frequentes

## 🎯 Sobre o Projeto

### O que foi implementado?
Sistema completo de ML com:
- Classificador de popularidade musical (Random Forest)
- Tuning automático (RandomizedSearchCV)
- Explicabilidade com SHAP (4 tipos de visualizações)
- Dashboard interativo (Dash + Plotly)
- Integração no app mobile (React Native + WebView)

### Quais são as exigências do professor?
✅ Tuning (GridSearch/RandomSearch)
✅ Exportar modelo (.pkl)
✅ Tela de classificação no dashboard
✅ Explicabilidade SHAP (global + local)
✅ Dashboard exposto no app

**Status**: Todas implementadas!

---

## 🚀 Setup e Instalação

### Como faço o setup inicial?
```powershell
.\setup_completo.ps1
```
Ou manualmente:
```powershell
cd analises
pip install -r ../requirements.txt
python train_model.py
cd ..
npm install
```

### Quanto tempo leva o setup?
- Instalação de dependências: 2-3 min
- Treinamento do modelo: 5-10 min
- **Total**: ~15 min na primeira vez

### Preciso treinar o modelo toda vez?
Não! Só precisa treinar UMA vez. O modelo fica salvo em `music_classifier_model.pkl`.

### Como sei se tudo está instalado corretamente?
```powershell
cd analises
python verificar_ambiente.py
```

---

## 🤖 Sobre o Modelo

### Que tipo de modelo é usado?
Random Forest Classifier com RandomizedSearchCV para otimização de hiperparâmetros.

### O que o modelo prevê?
Classifica músicas em 3 categorias de popularidade:
- **Baixa**: Poucas views/streams
- **Média**: Popularidade moderada
- **Alta**: Muito popular

### Quais features são usadas?
10 características musicais:
- Danceability, Energy, Loudness
- Speechiness, Acousticness, Instrumentalness  
- Liveness, Valence, Tempo, Duration_ms

### Como funciona o tuning?
RandomizedSearchCV testa 20 combinações de parâmetros:
- n_estimators: [50, 100, 200, 300]
- max_depth: [10, 20, 30, None]
- min_samples_split: [2, 5, 10]
- min_samples_leaf: [1, 2, 4]
- max_features: ['sqrt', 'log2']
- bootstrap: [True, False]

### Qual a acurácia do modelo?
Depende dos dados, mas geralmente entre 70-85%. O valor exato é mostrado após o treinamento.

---

## 📊 Sobre SHAP

### O que é SHAP?
SHAP (SHapley Additive exPlanations) é uma técnica de explicabilidade que mostra como cada feature contribui para as predições.

### Quais visualizações SHAP foram implementadas?

#### 1. Feature Importance Global
Ranking de importância das features (média do impacto absoluto).

#### 2. Beeswarm Plot
Mostra distribuição de impactos, relação entre valor e impacto.

#### 3. Gráfico Multiclasse  
Importância separada por classe (Baixa/Média/Alta).

#### 4. Force Plot (Local)
Explicação individual: quais features contribuíram para AQUELA predição específica.

### Como interpretar o Force Plot?
- **Vermelho**: Features que aumentam a probabilidade
- **Azul**: Features que diminuem a probabilidade
- **Tamanho**: Magnitude do impacto
- **Base value**: Valor médio do modelo
- **Output value**: Predição final

---

## 🎨 Sobre o Dashboard

### Como iniciar o dashboard?
```powershell
cd analises
python dashboardpq.py
```
Acesse: http://localhost:8050

### Quantas abas tem o dashboard?
3 abas:
1. **INFORMAÇÕES TÉCNICAS**: Metadados do dataset
2. **ANÁLISE MUSICAL**: Gráficos e correlações
3. **CLASSIFICAÇÃO & SHAP**: ⭐ Nova aba com ML

### Como usar a aba de classificação?
1. Insira valores das features (ex: Danceability = 0.7)
2. Clique em "Classificar Música"
3. Veja o resultado e probabilidades
4. Analise o Force Plot (explicação)
5. Role para ver visualizações globais

### Posso classificar várias músicas?
Sim! Mude os valores e clique novamente em "Classificar".

---

## 📱 Sobre o App

### Como o dashboard está integrado no app?
Via WebView na homepage, abaixo das recomendações de álbuns.

### Como acessar o dashboard no app?
1. Abra o app
2. Vá para a homepage
3. Role até o final
4. Clique na seta para expandir "Dashboard Analítico"

### Por que o WebView não carrega?
Possíveis causas:
1. Dashboard não está rodando → `python dashboardpq.py`
2. URL errada → deve ser http://localhost:8050
3. Dependência faltando → `npm install react-native-webview`

### Posso usar no Android/iOS?
Sim! O WebView funciona em ambas as plataformas.

---

## 🐛 Troubleshooting

### "Modelo não carregado" no dashboard
**Solução**: Execute o treinamento
```powershell
cd analises
python train_model.py
```

### "Módulo não encontrado" (Python)
**Solução**: Instale as dependências
```powershell
pip install -r requirements.txt
```

### "Cannot find module" (Node)
**Solução**: Instale as dependências
```powershell
npm install
```

### Dashboard carrega mas classificação não funciona
**Causas possíveis**:
1. Modelo não treinado → `python train_model.py`
2. Arquivo .pkl corrompido → delete e treine novamente
3. Versão incompatível do scikit-learn → reinstale

### WebView mostra tela branca
**Soluções**:
1. Aguarde alguns segundos (pode estar carregando)
2. Verifique se o dashboard está rodando
3. Teste a URL no navegador primeiro
4. Reinicie o app

### Treinamento muito lento
**Normal**! RandomizedSearchCV com 20 iterações e 3 folds leva tempo.
Para acelerar:
- Reduza `n_iter` em `train_model.py`
- Use menos dados
- Use menos folds (cv=2 em vez de 3)

---

## 📂 Arquivos Gerados

### Após o treinamento, quais arquivos são criados?
```
music_classifier_model.pkl        # Modelo completo
shap_analysis.pkl                 # Análise SHAP
shap_feature_importance.png       # Gráfico global
shap_beeswarm.png                 # Beeswarm plot
shap_multiclass_bar.png           # Gráfico multiclasse
temp_force_plot.png               # Force plot temporário
```

### Posso deletar esses arquivos?
Os .pkl são essenciais. As imagens .png são para referência e podem ser deletadas (serão recriadas).

### Onde ficam os arquivos?
No diretório `analises/`

---

## 🎓 Para a Apresentação

### O que mostrar ao professor?

#### 1. Processo de Treinamento
```powershell
python train_model.py
```
Mostra: tuning, métricas, geração dos gráficos SHAP.

#### 2. Dashboard Funcionando
```powershell
python dashboardpq.py
```
Navegar até "CLASSIFICAÇÃO & SHAP", classificar uma música.

#### 3. Integração no App
```powershell
npx expo start
```
Mostrar WebView na homepage.

### Quanto tempo leva a demo?
- Setup (se já feito): 0 min
- Mostrar treinamento: 2 min (ou pular se já treinado)
- Mostrar dashboard: 3-5 min
- Mostrar app: 2 min
- **Total**: ~10 min

### Preciso treinar na hora da apresentação?
Não! Se já tiver treinado antes, apenas inicie o dashboard e o app.

---

## 🔧 Customização

### Posso mudar os parâmetros do modelo?
Sim! Edite `train_model.py`:
```python
param_distributions = {
    'n_estimators': [100, 200, 300],  # Seus valores
    # ...
}
```

### Posso mudar a porta do dashboard?
Sim! Em `dashboardpq.py`:
```python
app.run(debug=True, port=8050)  # Mude 8050
```
E no app, mude a URL do WebView.

### Posso adicionar mais features?
Sim! Edite `feature_columns` em `train_model.py` e retreine.

---

## 💡 Dicas

### Dica 1: Use dois terminais
Um para o dashboard, outro para o app.

### Dica 2: Treine de noite
O treinamento leva tempo. Deixe rodando enquanto dorme.

### Dica 3: Teste o dashboard isoladamente
Antes de integrar no app, teste em http://localhost:8050

### Dica 4: Leia os logs
Erros geralmente são informativos. Leia as mensagens.

### Dica 5: Documentação é sua amiga
4 arquivos de docs:
- `RESUMO_EXECUTIVO.md`
- `INSTRUCOES_ML.md`
- `GUIA_RAPIDO.md`
- `COMANDOS.md`

---

## 📞 Ainda com dúvidas?

1. Leia `RESUMO_EXECUTIVO.md` para visão geral
2. Leia `INSTRUCOES_ML.md` para detalhes
3. Use `COMANDOS.md` para referência rápida
4. Execute `verificar_ambiente.py` para diagnosticar

---

**Última atualização**: 18/11/2025
