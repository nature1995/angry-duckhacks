import io
import os
import sys
from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types
from google.gax.errors import RetryError
# import google.auth
from google.oauth2 import service_account

from flask import Flask, render_template, request, json

from flask_socketio import SocketIO, emit

app = Flask(__name__)

socketio = SocketIO(app)

# credentials, project = google.auth.default()
credentials = service_account.Credentials.from_service_account_file(
    'google-api.json')
credentials = credentials.with_scopes(
    ['https://www.googleapis.com/auth/cloud-platform'])

client = speech.SpeechClient(credentials=credentials)


def processData(data):
    content = data
    audio = types.RecognitionAudio(content=content)

    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code='en-US')

    try:
        response = client.recognize(config=config, audio=audio)
        for result in response.results:
            print('transcript: ', result.alternatives)
            emit('transcript', result.alternatives[0].transcript)
    except RetryError as e:
        print("Error: {0}".format(e))
    except:
        print("Error:", sys.exc_info()[0])


@app.route('/')
def main():
    return render_template('index.html')

@socketio.on('stream')
def handle_stream(blob):
    processData(blob)

if __name__ == "__main__":
    socketio.run(app, '0.0.0.0')
