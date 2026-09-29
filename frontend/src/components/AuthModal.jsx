import React, { useState } from 'react';
import api from '../api';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (mode === 'signup') {
        res = await api.register(formData);
      } else {
        res = await api.login({ email: formData.email, password: formData.password });
      }

      if (res && res.data) {
        localStorage.setItem('estatex_token', res.data.token);
        localStorage.setItem('estatex_user', JSON.stringify(res.data));
        if (onAuthSuccess) onAuthSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="form-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>I am a</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="buyer">Home Buyer / Investor</option>
                  <option value="agent">Real Estate Agent</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="submit-auth-btn" disabled={loading}>
            {loading ? 'Authenticating with MongoDB...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
