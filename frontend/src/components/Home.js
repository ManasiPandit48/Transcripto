// src/components/Home.js
import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <video autoPlay loop muted className="background-video">
        <source src="/background4.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="content">
        <header className="home-header">
          <h1 className="fade-in">Welcome to the Speech-to-Text Transcription Tool</h1>
          <p className="slide-in">Your go-to solution for converting audio to text with ease.</p>
        </header>

        <section className="key-metrics">
          <div className="metric zoom-in">
            <h2>Total Transcriptions</h2>
            <p>1234</p> {/* Replace with dynamic data if available */}
          </div>
          <div className="metric zoom-in">
            <h2>Average Transcription Time</h2>
            <p>3.2 minutes</p> {/* Replace with dynamic data if available */}
          </div>
        </section>

        <section className="quick-access">
          <h2 className="slide-up">Quick Access</h2>
          <div className="access-links">
            <a href="/upload-record" className="access-link bounce">Upload/Record Audio</a>
            <a href="/transcriptions" className="access-link bounce">View Transcriptions</a>
            <a href="/help" className="access-link bounce">Help & Documentation</a>
          </div>
        </section>

        <section className="recent-activities">
          <h2 className="fade-in">Recent Activities</h2>
          <ul>
            <li>Uploaded file: <a href="#">file1.wav</a> - Transcript available</li>
            <li>Uploaded file: <a href="#">file2.mp3</a> - Transcript available</li>
            {/* Add more items or replace with dynamic data */}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Home;
