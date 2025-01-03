import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/loginPage.css';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      console.log('Registration successful:', data);
      navigate('/login'); // Redirect to the login page
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ width: '600px', height: '300px' }}>
        <div className="login-header">Register</div>
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
        <input
          type="password"
          placeholder="Confirm password"
          className="login-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button className="login-button" onClick={handleRegister}>
          Sign up
        </button>
        <div className="login-subtext">
          Already have an account?{' '}
          <a href="/login" className="create-account">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
