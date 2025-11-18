"""
Script para treinar modelo de classificação de músicas com Tuning
Inclui: GridSearch, exportação do modelo e análise SHAP
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import shap
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("INICIANDO TREINAMENTO DO MODELO")
print("=" * 60)

# 1. CARREGAR DADOS
print("\n[1/6] Carregando dados...")
try:
    df = pd.read_parquet('Spotify_Youtube.parquet')
    print(f"✓ Dataset carregado: {df.shape}")
except:
    df = pd.read_csv('Spotify_Youtube.csv')
    print(f"✓ Dataset CSV carregado: {df.shape}")

# 2. PREPARAR DADOS PARA CLASSIFICAÇÃO
print("\n[2/6] Preparando dados para classificação...")

# Definir target: classificar músicas em categorias de popularidade
# Baseado em Views + Streams
df['popularity_score'] = df['Views'].fillna(0) + df['Stream'].fillna(0)

# Criar categorias: Baixa, Média, Alta popularidade
df['popularity_class'] = pd.cut(
    df['popularity_score'], 
    bins=3, 
    labels=['Baixa', 'Média', 'Alta']
)

# Features para o modelo
feature_columns = [
    'Danceability', 'Energy', 'Loudness', 'Speechiness',
    'Acousticness', 'Instrumentalness', 'Liveness', 'Valence', 
    'Tempo', 'Duration_ms'
]

# Remover linhas com valores nulos nas features ou target
df_clean = df[feature_columns + ['popularity_class']].dropna()
print(f"✓ Dados limpos: {df_clean.shape}")
print(f"✓ Distribuição de classes:\n{df_clean['popularity_class'].value_counts()}")

# Separar features e target
X = df_clean[feature_columns]
y = df_clean['popularity_class']

# Split train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✓ Train: {X_train.shape}, Test: {X_test.shape}")

# 3. NORMALIZAÇÃO
print("\n[3/6] Normalizando features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
print("✓ Features normalizadas")

# 4. TUNING COM RANDOMIZED SEARCH
print("\n[4/6] Executando RandomizedSearchCV...")
print("Isso pode levar alguns minutos...")

# Definir grid de parâmetros
param_distributions = {
    'n_estimators': [50, 100, 200, 300],
    'max_depth': [10, 20, 30, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['sqrt', 'log2'],
    'bootstrap': [True, False]
}

# RandomForest como modelo base
rf = RandomForestClassifier(random_state=42)

# RandomizedSearch
random_search = RandomizedSearchCV(
    estimator=rf,
    param_distributions=param_distributions,
    n_iter=20,  # Número de combinações a testar
    cv=3,
    verbose=2,
    random_state=42,
    n_jobs=-1,
    scoring='accuracy'
)

random_search.fit(X_train_scaled, y_train)

print("\n✓ Tuning completo!")
print(f"✓ Melhores parâmetros: {random_search.best_params_}")
print(f"✓ Melhor score (CV): {random_search.best_score_:.4f}")

# Melhor modelo
best_model = random_search.best_estimator_

# 5. AVALIAR MODELO
print("\n[5/6] Avaliando modelo no conjunto de teste...")
y_pred = best_model.predict(X_test_scaled)
test_accuracy = accuracy_score(y_test, y_pred)

print(f"\n✓ Acurácia no teste: {test_accuracy:.4f}")
print("\n✓ Relatório de classificação:")
print(classification_report(y_test, y_pred))
print("\n✓ Matriz de confusão:")
print(confusion_matrix(y_test, y_pred))

# 6. EXPORTAR MODELO E SCALER
print("\n[6/6] Exportando modelo e scaler...")

# Criar dicionário com todos os componentes necessários
model_package = {
    'model': best_model,
    'scaler': scaler,
    'feature_names': feature_columns,
    'classes': list(best_model.classes_),
    'best_params': random_search.best_params_,
    'test_accuracy': test_accuracy
}

# Salvar
joblib.dump(model_package, 'music_classifier_model.pkl')
print("✓ Modelo salvo em: music_classifier_model.pkl")

# 7. ANÁLISE SHAP (Explicabilidade)
print("\n" + "=" * 60)
print("GERANDO ANÁLISES DE EXPLICABILIDADE (SHAP)")
print("=" * 60)

# Criar explainer SHAP
explainer = shap.TreeExplainer(best_model)
shap_values = explainer.shap_values(X_test_scaled)

# Salvar também o explainer e valores SHAP
shap_package = {
    'explainer': explainer,
    'shap_values': shap_values,
    'X_test': X_test_scaled,
    'X_test_original': X_test.values,
    'feature_names': feature_columns,
    'y_test': y_test.values
}
joblib.dump(shap_package, 'shap_analysis.pkl')
print("✓ Análise SHAP salva em: shap_analysis.pkl")

# Gerar gráficos SHAP
print("\n✓ Gerando gráficos de explicabilidade...")

# 1. Feature Importance Global
plt.figure(figsize=(10, 6))
shap.summary_plot(shap_values, X_test, feature_names=feature_columns, 
                  plot_type="bar", show=False, class_names=list(best_model.classes_))
plt.title("SHAP - Feature Importance Global")
plt.tight_layout()
plt.savefig('shap_feature_importance.png', dpi=150, bbox_inches='tight')
plt.close()
print("  ✓ Feature importance salvo: shap_feature_importance.png")

# 2. Beeswarm Plot (mostra distribuição de impacto)
plt.figure(figsize=(12, 10))
# Para multiclasse, mostrar apenas a classe majoritária ou fazer um plot por classe
# Vamos fazer um plot compacto mostrando as 3 classes
shap.summary_plot(shap_values, X_test, feature_names=feature_columns, 
                 show=False, plot_type="bar", class_names=list(best_model.classes_))
plt.title("SHAP - Beeswarm / Summary Plot")
plt.tight_layout()
plt.savefig('shap_beeswarm.png', dpi=150, bbox_inches='tight')
plt.close()
print("  ✓ Beeswarm plot salvo: shap_beeswarm.png")

# 3. Bar plot multiclasse
plt.figure(figsize=(12, 6))
shap.summary_plot(shap_values, X_test, feature_names=feature_columns,
                 plot_type="bar", show=False, class_names=list(best_model.classes_))
plt.title("SHAP - Importância por Classe")
plt.tight_layout()
plt.savefig('shap_multiclass_bar.png', dpi=150, bbox_inches='tight')
plt.close()
print("  ✓ Gráfico multiclasse salvo: shap_multiclass_bar.png")

print("\n" + "=" * 60)
print("TREINAMENTO COMPLETO!")
print("=" * 60)
print("\nArquivos gerados:")
print("  1. music_classifier_model.pkl - Modelo treinado")
print("  2. shap_analysis.pkl - Análises SHAP")
print("  3. shap_feature_importance.png")
print("  4. shap_beeswarm.png")
print("  5. shap_multiclass_bar.png")
print("\n✓ Pronto para uso no dashboard!")
