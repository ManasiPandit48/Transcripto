import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Translation.css';

const Translation = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndTranslateTranscripts = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all transcript files
        const response = await axios.get('http://localhost:5000/transcripts');
        const transcriptData = response.data.transcripts;

        if (!transcriptData || transcriptData.length === 0) {
          setTranscripts([]);
          setLoading(false);
          return;
        }

        // Translate each transcript into English
        const translations = await Promise.all(
          transcriptData.map(async (transcript) => {
            try {
              // Fetch the content of each transcript file
              const transcriptResponse = await axios.get(
                `http://localhost:5000/transcripts/${transcript.fileName}`
              );

              // Translate the content into English
              const translationResponse = await axios.post(
                'http://localhost:5000/translate',
                {
                  text: transcriptResponse.data,
                  target_language: 'en',
                }
              );

              return {
                fileName: transcript.fileName,
                translatedText: translationResponse.data.translated_text,
                translatedFilePath: translationResponse.data.translated_file_path,
              };
            } catch (error) {
              console.error(`Error translating ${transcript.fileName}:`, error);
              return {
                fileName: transcript.fileName,
                translatedText: 'Translation failed.',
                translatedFilePath: null,
              };
            }
          })
        );

        setTranscripts(translations);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
        setError('Failed to fetch transcripts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndTranslateTranscripts();

    // Cleanup function to delete all translated files
    const cleanup = async () => {
      try {
        await axios.delete('http://localhost:5000/delete-translated-files');
        console.log('Translated files deleted successfully.');
      } catch (error) {
        console.error('Error deleting translated files:', error);
      }
    };

    // Attach cleanup function to unmount and window unload events
    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  return (
    <div className="translation">
      <h1>Translated Transcripts</h1>
      {loading && <p>Loading transcripts...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && transcripts.length === 0 && !error && <p>No transcripts available for translation.</p>}
      {!loading && transcripts.length > 0 && (
        <ul>
          {transcripts.map((transcript, index) => (
            <li key={index}>
              <strong>File:</strong> {transcript.fileName}
              <br />
              <strong>Translated Text:</strong> {transcript.translatedText}
              {transcript.translatedFilePath && (
                <>
                  <br />
                  <a href={`http://localhost:5000${transcript.translatedFilePath}`} download>
                    Download Translated File
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Translation;
