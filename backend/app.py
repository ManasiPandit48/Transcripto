import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from transformers import pipeline
import torch
from datetime import datetime
from googletrans import Translator

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the application
CORS(app)

# Directory paths
UPLOAD_FOLDER = 'uploads'
TRANSCRIPT_FOLDER = 'transcripts'
UPLOADS_TRANSCRIPTS_FOLDER = 'uploads_transcripts'  # New folder for translated files

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPT_FOLDER, exist_ok=True)
os.makedirs(UPLOADS_TRANSCRIPTS_FOLDER, exist_ok=True)  # Ensure new folder exists

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TRANSCRIPT_FOLDER'] = TRANSCRIPT_FOLDER
app.config['UPLOADS_TRANSCRIPTS_FOLDER'] = UPLOADS_TRANSCRIPTS_FOLDER

# Device setup for models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Supported models for multiple languages
SUPPORTED_MODELS = {
    "marathi": "ManasiPandit/whisper-small-finetuned-common-voice-mr",
    "english": "openai/whisper-small",
    "hindi": "ManasiPandit/whisper-small-finetuned-common-voice-hi"  # Example placeholder
}

# Cache for loaded models
loaded_models = {}

# Function to get the appropriate model
def get_model(language):
    if language not in SUPPORTED_MODELS:
        raise ValueError(f"Language '{language}' is not supported.")
    if language not in loaded_models:
        # Load and cache the model for the language
        loaded_models[language] = pipeline(
            "automatic-speech-recognition",
            model=SUPPORTED_MODELS[language],
            device=device
        )
    return loaded_models[language]

# Endpoint to transcribe audio
@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        # Check for audio file
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        if not audio_file or audio_file.filename == '':
            return jsonify({"error": "Invalid or missing audio file"}), 400

        # Check for language parameter
        language = request.form.get('language')
        if not language:
            return jsonify({"error": "Language parameter is missing."}), 400

        # Load the appropriate model
        try:
            model = get_model(language)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Save uploaded file
        audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
        audio_file.save(audio_path)

        if not os.path.exists(audio_path):
            return jsonify({"error": "Failed to save audio file"}), 500

        # Validate audio file format
        allowed_extensions = {'mp3', 'wav', 'ogg', 'flac'}
        if not audio_file.filename.split('.')[-1].lower() in allowed_extensions:
            return jsonify({"error": "Unsupported audio format"}), 400

        # Transcribe using the selected model
        try:
            transcription_result = model(audio_path)
            transcription = transcription_result["text"]
        except Exception as e:
            return jsonify({"error": f"Failed to transcribe audio: {str(e)}"}), 500

        # Save transcription
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        transcript_filename = f"transcript_{language}_{timestamp}.txt"
        transcript_path = os.path.join(TRANSCRIPT_FOLDER, transcript_filename)
        with open(transcript_path, 'w', encoding='utf-8') as f:
            f.write(transcription)

        return jsonify({
            "message": "Transcription successful",
            "transcript": transcription,
            "transcript_file": transcript_filename
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# Endpoint to list all transcriptions (.txt files)
@app.route('/transcripts', methods=['GET'])
def get_transcriptions():
    try:
        # List all transcript files in the folder
        transcriptions = []
        for file_name in os.listdir(TRANSCRIPT_FOLDER):
            if file_name.endswith('.txt'):
                # Add to list with filename and creation date
                file_path = os.path.join(TRANSCRIPT_FOLDER, file_name)
                file_info = {
                    "fileName": file_name,
                    "date": os.path.getmtime(file_path)  # Get file modification date
                }
                transcriptions.append(file_info)

        if not transcriptions:
            return jsonify({"message": "No transcriptions found"}), 200

        return jsonify({"transcripts": transcriptions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Endpoint to serve the content of a specific transcription file
@app.route('/transcripts/<filename>', methods=['GET'])
def get_transcription(filename):
    try:
        return send_from_directory(TRANSCRIPT_FOLDER, filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404


# Endpoint to delete a transcription file
@app.route('/transcripts/<filename>', methods=['DELETE'])
def delete_transcription(filename):
    try:
        os.remove(os.path.join(TRANSCRIPT_FOLDER, filename))
        return jsonify({'message': 'File deleted successfully'})
    except Exception as e:
        return jsonify({'error': 'Failed to delete file'}), 500


# Endpoint to update the content of a transcription file
@app.route('/transcripts/<filename>', methods=['PUT'])
def update_transcription(filename):
    try:
        new_content = request.json.get('content')
        if not new_content:
            return jsonify({'error': 'No content provided'}), 400
        file_path = os.path.join(TRANSCRIPT_FOLDER, filename)
        with open(file_path, 'w') as f:
            f.write(new_content)
        return jsonify({'message': 'File updated successfully'})
    except Exception as e:
        return jsonify({'error': 'Failed to update file'}), 500


# Endpoint to translate text
@app.route('/translate', methods=['POST'])
def translate_text():
    try:
        # Get the text and target language from the request
        text = request.json.get('text')
        target_language = request.json.get('target_language')

        if not text or not target_language:
            return jsonify({"error": "Text and target_language are required."}), 400

        # Use Google Translate for translation
        translator = Translator()
        translated = translator.translate(text, dest=target_language)

        # Save translated text to a new file in uploads_transcripts folder
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        translated_filename = f"translated_{target_language}_{timestamp}.txt"
        translated_file_path = os.path.join(app.config['UPLOADS_TRANSCRIPTS_FOLDER'], translated_filename)

        with open(translated_file_path, 'w', encoding='utf-8') as f:
            f.write(translated.text)

        # Return the translated text and file path as per the frontend's needs
        return jsonify({
            "original_text": text,
            "translated_text": translated.text,
            "translated_file_path": f"/uploads_transcripts/{translated_filename}",
            "target_language": target_language
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred during translation: {str(e)}"}), 500

@app.route('/delete-translated-files', methods=['DELETE'])
def delete_translated_files():
    try:
        folder_path = app.config['UPLOADS_TRANSCRIPTS_FOLDER']
        for filename in os.listdir(folder_path):
            if filename.startswith('translated_'):  # Only delete translated files
                file_path = os.path.join(folder_path, filename)
                os.remove(file_path)
        return jsonify({"message": "All translated files deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete translated files: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
