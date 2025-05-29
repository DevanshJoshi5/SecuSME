import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';  // Updated import
import '../styles/auth.css';
const Login = ({ setUser }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      setUser({ username });
      navigate('/landing');
    } catch (err) {
      setError(t('invalid_credentials'));
    }
  };
  const handleGoogleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google JWT decoded:', decoded);

      localStorage.setItem('token', credentialResponse.credential);

      setUser({
        username: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });

      navigate('/landing');
    } catch (error) {
      console.error('Google login decoding error:', error);
      setError(t('login_failed'));
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google Sign-In failed');
    setError(t('login_failed'));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('welcome')}</h2>
        <p>{t('login_to_secure')}</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t('username')}</label>
            <input
              type="text"
              placeholder={t('e.g_username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              placeholder={t('password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">
            {t('login')}
          </button>
        </form>

        <div className="google-login-wrapper" style={{ marginTop: '20px' }}>
          <p>{t('or_login_with_google')}</p>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>
        
        <p className="auth-link">
          {t('dont_have_account')} <a href="/register">{t('register')}</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
