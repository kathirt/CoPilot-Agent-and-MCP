import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to reset password');
      setSuccess('Password has been reset successfully. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!email || !token) {
    return (
      <div>
        <h2>Reset Password</h2>
        <div style={{ color: 'red' }}>Invalid or missing reset link.</div>
        <Link to="/forgot-password">Request a new reset link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <input
        name="newPassword"
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
      />
      <button id="reset-password" type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPassword;
