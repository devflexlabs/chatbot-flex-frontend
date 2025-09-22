from flask import Flask, request, jsonify
from flask_cors import CORS
from agenteia import SQLAgent

app = Flask(__name__)
CORS(app)

@app.route('/query', methods=['POST'])
def handle_query():
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'Nenhuma consulta fornecida'}), 400
    
    # Cria o agente para cada requisição (evita conflito de conexão)
    agent = SQLAgent()
    try:
        resposta = agent.process_natural_query(query)
    except Exception as e:
        return jsonify({'error': f'Erro ao processar consulta: {str(e)}'}), 500
    finally:
        agent.close()
    
    return jsonify({'response': resposta})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)