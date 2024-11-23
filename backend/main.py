from flask import Flask, request, jsonify
from rag import RagPipeline

app = Flask(__name__)

@app.route("/upload_document", methods=['POST'])
def handle_document():
    data = request.get_json()
    array = data['array']

    return jsonify({"" : ""}) # Return value


if __name__ == '__main__':
    app.run(port=5000)