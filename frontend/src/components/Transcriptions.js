import React, { useState, useEffect } from 'react';
import './Transcriptions.css';
import axios from 'axios';

const Transcriptions = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  // Fetch transcriptions when the component mounts
  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        console.log('Fetching transcriptions...');
        const response = await axios.get('http://localhost:5000/transcripts');
        console.log('API Response:', response.data);

        if (response.data && response.data.transcripts) {
          setTranscriptions(response.data.transcripts); // Align with backend response
        } else {
          setError('No transcription data found.');
        }
      } catch (err) {
        console.error('Error fetching transcriptions:', err);
        setError('Failed to load transcriptions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, []);

  // Handle download of a transcription file
  const handleDownload = (fileName) => {
    window.open(`http://localhost:5000/transcripts/${fileName}`, '_blank');
  };

  // Handle deletion of a transcription file
  const handleDelete = async (fileName) => {
    const confirmation = window.confirm('Are you sure you want to delete this transcription?');
    if (!confirmation) return;

    try {
      await axios.delete(`http://localhost:5000/transcripts/${fileName}`);
      setTranscriptions(transcriptions.filter((t) => t.fileName !== fileName));
      alert('Transcription deleted successfully.');
    } catch (err) {
      console.error('Error deleting transcription:', err);
      alert('Failed to delete transcription.');
    }
  };

  // Handle edit mode activation
  const handleEdit = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000/transcripts/${fileName}`);
      setEditedContent(response.data); // Assuming the response contains the file content
      setCurrentFile(fileName);
      setEditMode(true);
    } catch (err) {
      console.error('Error loading file for editing:', err);
      alert('Failed to load file for editing.');
    }
  };

  // Save edited content
  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/transcripts/${currentFile}`, { content: editedContent });
      alert('Transcription updated successfully.');
      setEditMode(false);
      setCurrentFile(null);
      setEditedContent('');
      // Reload transcriptions to reflect the updated content
      const response = await axios.get('http://localhost:5000/transcripts');
      setTranscriptions(response.data.transcripts);
    } catch (err) {
      console.error('Error saving edited transcription:', err);
      alert('Failed to save changes.');
    }
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setEditMode(false);
    setCurrentFile(null);
    setEditedContent('');
  };

  return (
    <div className="transcriptions">
      <h1>Your Transcriptions</h1>
      <p>View and manage your recent transcriptions here.</p>

      {loading && <p>Loading transcriptions...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && transcriptions.length === 0 && (
        <p>No transcriptions found. Upload or record audio to generate one!</p>
      )}

      {!loading && transcriptions.length > 0 && !editMode && (
        <table className="transcription-table">
          <thead>
            <tr>
              <th>#</th>
              <th>File Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transcriptions.map((transcription, index) => (
              <tr key={transcription.fileName}>
                <td>{index + 1}</td>
                <td>{transcription.fileName}</td>
                <td>{new Date(transcription.date).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDownload(transcription.fileName)}>Download</button>
                  <button onClick={() => handleDelete(transcription.fileName)}>Delete</button>
                  <button onClick={() => handleEdit(transcription.fileName)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editMode && (
        <div className="edit-mode">
          <h2>Editing {currentFile}</h2>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows="10"
            cols="50"
          />
          <div className="edit-buttons">
            <button onClick={saveEdit}>Save</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transcriptions;
