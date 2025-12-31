import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand" onClick={handleLinkClick}>
          FocusFlow
        </Link>
        {isAuthenticated && (
          <>
            <button
              className="navbar-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={mobileMenuOpen ? 'hamburger open' : 'hamburger'}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            {mobileMenuOpen && (
              <div className="navbar-overlay" onClick={handleLinkClick}></div>
            )}
            <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
              <Link to="/dashboard" className="navbar-link" onClick={handleLinkClick}>
                Dashboard
              </Link>
              <Link to="/analytics" className="navbar-link" onClick={handleLinkClick}>
                Analytics
              </Link>
              <Link to="/settings" className="navbar-link" onClick={handleLinkClick}>
                Settings
              </Link>
              <div className="navbar-user-section">
                <span className="navbar-user">{user?.username}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

