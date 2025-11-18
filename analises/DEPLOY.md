# Deploy da API de Classificação ML

## Opção 1: Render (Recomendado - Gratuito)

### Passo a passo:

1. **Criar conta no Render**: https://render.com
2. **Fazer commit do código**:
   ```bash
   git add analises/
   git commit -m "Add ML API for deployment"
   git push
   ```

3. **Criar Web Service no Render**:
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - **Name**: needledrop-ml-api
     - **Root Directory**: analises
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn api_classificacao:app`
     - **Plan**: Free

4. **Adicionar arquivo do modelo**:
   - Faça upload manual do `music_classifier_model.pkl` no dashboard do Render
   - Ou adicione ao Git (se < 100MB):
     ```bash
     cd analises
     git add music_classifier_model.pkl
     git commit -m "Add ML model"
     git push
     ```

5. **Copiar URL da API**:
   - Após deploy, copie a URL (ex: `https://needledrop-ml-api.onrender.com`)
   - Adicione no arquivo `.env`:
     ```
     EXPO_PUBLIC_ML_API_URL=https://needledrop-ml-api.onrender.com/api
     ```

## Opção 2: Railway (Alternativa gratuita)

1. **Criar conta**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Configure**:
   - Root Directory: `analises`
   - Start Command: `python api_classificacao.py`
4. **Adicionar variável**: `PORT=8080`
5. **Upload do modelo** via Railway CLI ou Git

## Opção 3: Fly.io

1. Instalar Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Login: `flyctl auth login`
3. Deploy:
   ```bash
   cd analises
   flyctl launch
   flyctl deploy
   ```

## Após o Deploy

1. Teste a API:
   ```bash
   curl https://sua-url.onrender.com/api/status
   ```

2. Atualize o app para usar a URL de produção:
   - Edite `app/classificacao.tsx`
   - Substitua o getApiUrl() para usar a variável de ambiente

## Limitações do Plano Gratuito

- **Render**: API dorme após 15min de inatividade (demora ~30s para acordar)
- **Railway**: 500 horas/mês gratuitas
- **Fly.io**: 3 VMs pequenas gratuitas

## Solução de Problemas

Se o modelo for muito grande (>100MB):
1. Use Git LFS para versionamento
2. Ou hospede o modelo no Hugging Face Hub
3. Ou use Railway/Fly.io que aceitam arquivos maiores
