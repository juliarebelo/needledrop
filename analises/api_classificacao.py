from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Suporte para ambiente de produção
MODEL_PATH = os.environ.get('MODEL_PATH', 'music_classifier_model.pkl')

try:
    model_package = joblib.load(MODEL_PATH)
    MODEL_LOADED = True
    print("✓ Modelo carregado com sucesso!")
except Exception as e:
    print(f"⚠ Erro ao carregar modelo: {e}")
    MODEL_LOADED = False
    model_package = None

@app.route('/api/status', methods=['GET'])
def status():
    """Verifica se o modelo está carregado"""
    return jsonify({
        'status': 'online',
        'model_loaded': MODEL_LOADED,
        'features': model_package['feature_names'] if MODEL_LOADED else []
    })

@app.route('/api/classify', methods=['POST'])
def classify():
    """
    Classifica uma música baseado nas características
    
    Body JSON esperado:
    {
        "danceability": 0.5,
        "energy": 0.8,
        "valence": 0.6,
        "tempo": 120,
        "loudness": -5,
        "speechiness": 0.1,
        "acousticness": 0.3,
        "instrumentalness": 0.0,
        "liveness": 0.1,
        "duration_ms": 200000
    }
    """
    if not MODEL_LOADED:
        return jsonify({'error': 'Modelo não carregado'}), 500
    
    try:
        data = request.json
        
        feature_names = model_package['feature_names']
        features = []
        
        for feature in feature_names:
            feature_lower = feature.lower()
            if feature_lower == 'duration_ms':
                value = data.get('duration_ms', data.get('Duration_ms', 200000))
            else:
                value = data.get(feature, data.get(feature_lower, data.get(feature.title(), 0.5)))
            features.append(float(value))
        
        input_data = pd.DataFrame([features], columns=feature_names)
        
        scaler = model_package['scaler']
        input_scaled = scaler.transform(input_data)
        
        model = model_package['model']
        prediction = model.predict(input_scaled)[0]
        probabilities = model.predict_proba(input_scaled)[0]
        
        print(f"Predição raw: {prediction}, tipo: {type(prediction)}")
        print(f"Probabilidades: {probabilities}")
        
        # Mapear classes - prediction pode ser int ou string
        class_mapping = {0: 'Baixa', 1: 'Média', 2: 'Alta'}
        
        # Converter para int se necessário
        if isinstance(prediction, str):
            # Se for string, tentar mapear de volta para índice
            reverse_map = {'Baixa': 0, 'Média': 1, 'Alta': 2}
            pred_idx = reverse_map.get(prediction, 0)
            predicted_class = prediction
        else:
            pred_idx = int(prediction)
            predicted_class = class_mapping.get(pred_idx, f"Classe {pred_idx}")
        
        probs_dict = {
            class_mapping[i]: float(prob) 
            for i, prob in enumerate(probabilities)
        }
        
        return jsonify({
            'prediction': predicted_class,
            'probabilities': probs_dict,
            'confidence': float(max(probabilities)),
            'input_features': dict(zip(feature_names, features))
        })
        
    except Exception as e:
        import traceback
        print(f"Erro na classificação: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

@app.route('/api/features', methods=['GET'])
def get_features():
    """Retorna lista de features esperadas"""
    if not MODEL_LOADED:
        return jsonify({'error': 'Modelo não carregado'}), 500
    
    return jsonify({
        'features': model_package['feature_names'],
        'description': {
            'Danceability': 'Dançabilidade (0-1)',
            'Energy': 'Energia (0-1)',
            'Valence': 'Tom emocional (0-1)',
            'Tempo': 'Tempo em BPM (40-200)',
            'Loudness': 'Volume em dB (-60 a 0)',
            'Speechiness': 'Presença de fala (0-1)',
            'Acousticness': 'Acústico (0-1)',
            'Instrumentalness': 'Instrumental (0-1)',
            'Liveness': 'Ao vivo (0-1)',
            'Duration_ms': 'Duração em milissegundos'
        }
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎵 API de Classificação de Músicas")
    print("="*60)
    if MODEL_LOADED:
        print(f"✓ Modelo: {model_package['model'].__class__.__name__}")
        print(f"✓ Features: {len(model_package['feature_names'])}")
        print(f"✓ Classes: Baixa, Média, Alta")
    print("\n🌐 Endpoints disponíveis:")
    print("  GET  /api/status   - Status do modelo")
    print("  GET  /api/features - Lista de features")
    print("  POST /api/classify - Classificar música")
    
    port = int(os.environ.get('PORT', 5000))
    print(f"\n▶  Rodando em: http://0.0.0.0:{port}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)
