import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          Transcripto
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={toggleMobileMenu}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/upload-record" className="nav-link" onClick={toggleMobileMenu}>
                Upload/Record
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/transcriptions" className="nav-link" onClick={toggleMobileMenu}>
                Transcriptions
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/translation" className="nav-link" onClick={toggleMobileMenu}>
                Translation
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/analytics" className="nav-link" onClick={toggleMobileMenu}>
                Analytics & Reports
              </Link>
            </li>
          </ul>
          <div className="d-flex">
            <Link to="/help" className="btn btn-outline-light me-2" onClick={toggleMobileMenu}>
              Help & Documentation
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
