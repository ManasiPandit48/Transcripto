// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import UploadRecord from './components/UploadRecord';
import Transcriptions from './components/Transcriptions';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import Help from './components/Help';
import Profile from './components/Profile';
import Admin from './components/Admin';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload-record" element={<UploadRecord />} />
          <Route path="/transcriptions" element={<Transcriptions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/help" element={<Help />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
