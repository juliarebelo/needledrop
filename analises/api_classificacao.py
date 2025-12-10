from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(__file__), 'music_classifier_model.pkl'))

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
        def _normalize_key(k: str):
            return str(k).strip().lower().replace(' ', '_')

        SYNONYMS = {
            'tempo': ['tempo', 'bpm'],
            'loudness': ['loudness', 'volume', 'db'],
            'duration_ms': ['duration_ms', 'duration', 'durationms', 'duration_ms'],
        }

        for feature in feature_names:
            norm = _normalize_key(feature)

            candidates = [
                feature,
                feature.lower(),
                feature.title(),
                feature.replace(' ', '_'),
                feature.lower().replace(' ', '_'),
                norm
            ]

            value = None
            for c in candidates:
                if c in data:
                    value = data[c]
                    break

            if value is None:
                for syn_key, aliases in SYNONYMS.items():
                    if norm == syn_key:
                        for alias in aliases:
                            if alias in data:
                                value = data[alias]
                                break
                    if value is not None:
                        break

            if value is None:
                for k in list(data.keys()):
                    if _normalize_key(k) == norm:
                        value = data[k]
                        break

            if value is None:
                value = 200000 if norm == 'duration_ms' else 0.5

            try:
                features.append(float(value))
            except Exception:
                print(f"Warning: não foi possível converter feature {feature} (valor: {value}), usando fallback")
                features.append(200000.0 if norm == 'duration_ms' else 0.5)

        print("Input features antes do scaler:", dict(zip(feature_names, features)))

        input_data = pd.DataFrame([features], columns=feature_names)

        scaler = model_package['scaler']
        input_scaled = scaler.transform(input_data)

        model = model_package['model']
        classes = model_package['classes']  # ['Alta', 'Baixa', 'Média']
        
        probabilities = model.predict_proba(input_scaled)[0]

        # Mapear probabilidades para as classes
        class_to_prob = dict(zip(classes, probabilities))
        
        # Encontrar a classe com maior probabilidade
        predicted_class = max(class_to_prob, key=class_to_prob.get)
        confidence = class_to_prob[predicted_class]
        
        print(f"Probabilidades: {probabilities}")
        print(f"Classes: {classes}")
        print(f"Mapeamento: {class_to_prob}")
        print(f"✓ Predição: {predicted_class} (confiança: {confidence:.3%})")
        
        probs_dict = {str(k): float(v) for k, v in class_to_prob.items()}

        return jsonify({
            'prediction': predicted_class,
            'probabilities': probs_dict,
            'confidence': float(confidence),
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
    print(" API de Classificação de Músicas")
    print("="*60)
    if MODEL_LOADED:
        print(f"✓ Modelo: {model_package['model'].__class__.__name__}")
        print(f"✓ Features: {len(model_package['feature_names'])}")
        print(f"✓ Classes: Baixa, Média, Alta")
    print("\nEndpoints disponíveis:")
    print("  GET  /api/status   - Status do modelo")
    print("  GET  /api/features - Lista de features")
    print("  POST /api/classify - Classificar música")

    port = int(os.environ.get('PORT', 5000))
    print(f"\n▶  Rodando em: http://0.0.0.0:{port}")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=port, debug=False)