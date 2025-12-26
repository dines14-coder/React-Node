import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { login } from '../services/api';
import '../styles/login.css';
import { vendorImage } from '../assets/images';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      onLogin(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Vendor Image */}
      <div className="login-left">
        <img
          src={vendorImage}
          alt="Influencer Platform"
          className="vendor-image"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to Influencer</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* <div className="test-credentials">
            <h4>Test Credentials</h4>
            <p><strong>Emails:</strong> sa@admin.com, admin1@admin.com, admin2@admin.com, admin3@admin.com</p>
            <p><strong>Password:</strong> password</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Login;