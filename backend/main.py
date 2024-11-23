from flask import Flask, requests, jsonify

app = Flask(__name__)

@app.route("/upload_document")
def handle_document():
    
    return "Hello World"


if __name__ == '__main__':
    app.run(port=5000)