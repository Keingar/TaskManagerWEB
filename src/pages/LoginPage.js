import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/loginPage.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      setErrorMessage(error.message);
    } else {
      console.log('Login successful:', data);
      navigate('/content'); // Redirect to /content page after login
    }
  };
  

  
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">Sign in</div>
        <div className="login-subtext">
          New user?{' '}
          <a href="/register" className="create-account">
            Create an account
          </a>
        </div>
        <input
          type="text"
          placeholder="Write your login"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Write your password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleLogin}>
          Sign in
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
