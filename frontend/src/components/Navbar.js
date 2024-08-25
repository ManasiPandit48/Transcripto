import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">MyApp</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/upload-record">Upload/Record</Link></li>
        <li><Link to="/transcriptions">Transcriptions</Link></li>
        <li><Link to="/settings">Languages & Settings</Link></li>
        <li><Link to="/analytics">Analytics & Reports</Link></li>
        <li><Link to="/help">Help & Documentation</Link></li>
      </ul>
      <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
        ☰
      </div>
      {mobileMenuOpen && (
        <ul className="nav-links-mobile show-mobile-menu">
          <li><Link to="/" onClick={toggleMobileMenu}>Home</Link></li>
          <li><Link to="/upload-record" onClick={toggleMobileMenu}>Upload/Record</Link></li>
          <li><Link to="/transcriptions" onClick={toggleMobileMenu}>Transcriptions</Link></li>
          <li><Link to="/settings" onClick={toggleMobileMenu}>Languages & Settings</Link></li>
          <li><Link to="/analytics" onClick={toggleMobileMenu}>Analytics & Reports</Link></li>
          <li><Link to="/help" onClick={toggleMobileMenu}>Help & Documentation</Link></li>
          <span className="close-icon" onClick={toggleMobileMenu}>×</span>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
