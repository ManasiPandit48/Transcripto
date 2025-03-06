import React, { useState, useRef } from 'react';
import axios from 'axios';
import './UploadRecord.css';

const UploadRecord = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Loading state
  const [selectedLanguage, setSelectedLanguage] = useState('english'); // Language selection state
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      uploadFile(file);
    } else {
      alert('Please upload a valid audio file.');
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setRecordedBlob(audioBlob);
        audioChunks.current = [];
        uploadFile(audioBlob, 'recorded_audio.wav');
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const uploadFile = async (file, fileName = null) => {
    setIsUploading(true); // Start loading spinner
    const formData = new FormData();
    formData.append('audio', file, fileName || file.name);
    formData.append('language', selectedLanguage); // Include selected language

    try {
      const response = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTranscript(response.data.transcript);
      alert('Transcription successful!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error transcribing the audio file. Please try again.');
    } finally {
      setIsUploading(false); // Stop loading spinner
    }
  };

  return (
    <div className="upload-record">
      <h1>Upload or Record Audio</h1>
      <p>Choose a file to upload or start recording live audio.</p>

      <div className="language-selection">
        <label htmlFor="language-select">Select Language:</label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="marathi">Marathi</option> {/* Corrected language options */}
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
        </select>
      </div>

      <div className="upload-area">
        <p>Drag and drop your audio file here or click to select.</p>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" className="upload-button">Choose File</label>
      </div>

      <div className="recording-controls">
        <button onClick={handleRecordClick} disabled={isUploading}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {isRecording && <p className="recording-status">Recording...</p>}
      </div>

      {isUploading && <p className="loading">Processing your file, please wait...</p>}

      {transcript && (
        <div className="transcript">
          <h2>Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default UploadRecord;
