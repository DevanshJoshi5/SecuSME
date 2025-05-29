import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import LanguageSwitcher from './languageswitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const showScanLink = location.pathname === '/landing';

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>{t('secusme')}</h1>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/landing">{t('home')}</Link>
        </li>
        {showScanLink && (
          <>
            <li>
              <Link to="/scan">{t('start_scan')}</Link>
            </li>
            <li>
              <Link to="/phishing">Phishing Detector</Link>
            </li>
          </>
        )}
        <li>
          <button onClick={handleLogout} className="logout-button">
            {t('logout')}
          </button>
        </li>
      </ul>
      <LanguageSwitcher />
    </nav>
  );
};

export default Navbar;
