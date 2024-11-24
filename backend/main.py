from flask import Flask, request, jsonify
from rag import RagPipeline
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

rag_pipeline = RagPipeline(os.environ['COHERE_KEY'], os.environ['PINECONE_KEY'])

@app.route("/upload_document", methods=['POST'])
def handle_document():
    data = request.get_json()
    array = data

    return_value = rag_pipeline.chunking(array, array[0]['siteId']) # Same siteId for all documents

    if return_value:
        return  "Success", 200 # Return value
    else:
        return "Error", 400

@app.route("/get_chunk", methods=['GET'])
def get_chunk():
    data = request.get_json()

    result = rag_pipeline.relevant_info(data[0]['prompt'], data[0]['siteId'])

    print(result)

    return "Success", 200
    
if __name__ == '__main__':
    app.run(port=5000, host='0.0.0.0')