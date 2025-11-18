"""
Script de teste rápido para verificar instalação e funcionamento
"""

print("=" * 60)
print("VERIFICANDO AMBIENTE")
print("=" * 60)

# Verificar imports
print("\n1. Verificando bibliotecas...")
try:
    import pandas as pd
    print("  ✓ pandas")
    import numpy as np
    print("  ✓ numpy")
    import sklearn
    print("  ✓ scikit-learn")
    import joblib
    print("  ✓ joblib")
    import shap
    print("  ✓ shap")
    import dash
    print("  ✓ dash")
    import plotly
    print("  ✓ plotly")
    print("\n✓ Todas as bibliotecas instaladas!")
except ImportError as e:
    print(f"\n✗ Erro: {e}")
    print("Execute: pip install -r requirements.txt")
    exit(1)

# Verificar dados
print("\n2. Verificando dados...")
import os
if os.path.exists('Spotify_Youtube.parquet'):
    print("  ✓ Spotify_Youtube.parquet encontrado")
elif os.path.exists('Spotify_Youtube.csv'):
    print("  ✓ Spotify_Youtube.csv encontrado")
else:
    print("  ✗ Dataset não encontrado!")
    exit(1)

# Verificar modelo
print("\n3. Verificando modelo treinado...")
if os.path.exists('music_classifier_model.pkl'):
    print("  ✓ Modelo encontrado")
    model_package = joblib.load('music_classifier_model.pkl')
    print(f"  ✓ Acurácia: {model_package['test_accuracy']:.4f}")
else:
    print("  ✗ Modelo não encontrado")
    print("  Execute: python train_model.py")

# Verificar SHAP
print("\n4. Verificando análise SHAP...")
if os.path.exists('shap_analysis.pkl'):
    print("  ✓ Análise SHAP encontrada")
if os.path.exists('shap_feature_importance.png'):
    print("  ✓ Feature importance")
if os.path.exists('shap_beeswarm.png'):
    print("  ✓ Beeswarm plot")
if os.path.exists('shap_multiclass_bar.png'):
    print("  ✓ Gráfico multiclasse")

print("\n" + "=" * 60)
print("TUDO PRONTO!")
print("=" * 60)
print("\nPara iniciar o dashboard:")
print("  python dashboardpq.py")
print("\nPara acessar:")
print("  http://localhost:8050")
