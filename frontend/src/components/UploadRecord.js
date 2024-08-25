// src/components/UploadRecord.js
import React, { useState, useRef } from 'react';
import './UploadRecord.css';

const UploadRecord = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  // Start or stop recording
  const handleRecordClick = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  // Start recording function
  const startRecording = async () => {
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
    };

    mediaRecorder.start();
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!recordedBlob) return;

    const formData = new FormData();
    formData.append('file', recordedBlob, 'recorded_audio.wav');

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Prevent default behavior for drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="upload-record">
      <h1>Upload or Record Audio</h1>
      <p>Choose a file to upload or start recording live audio.</p>
      
      <div 
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
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
        <button onClick={handleRecordClick}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {isRecording && <p className="recording-status">Recording...</p>}
        {recordedBlob && !isRecording && (
          <>
            <button onClick={handleUpload} className="upload-button">Upload</button>
            <p className="recording-status">Recording stopped. You can now upload the file.</p>
          </>
        )}
        {transcript && (
          <div className="transcript">
            <h2>Transcript:</h2>
            <p>{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadRecord;
