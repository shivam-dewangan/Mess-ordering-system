import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

const fillDemo = (type) => {
    if (type === 'student') setForm({ email: 'student@campus.com', password: 'student123' });
    else if (type === 'admin') setForm({ email: 'admin@campus.com', password: 'admin123' });
    else if (type === 'shop') setForm({ email: 'shop@shop.com', password: 'shop@shop.com' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob blob1" />
        <div className="auth-blob blob2" />
      </div>
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">🍱</div>
          <h1>CampusEats</h1>
          <p>Order from your campus mess & cafeteria</p>
        </div>

        <div className="demo-btns">
          <span>Try demo:</span>
          <button type="button" onClick={() => fillDemo('student')} className="demo-btn">👨‍🎓 Student</button>
          <button type="button" onClick={() => fillDemo('admin')} className="demo-btn">👨‍🍳 Admin</button>
          <button type="button" onClick={() => fillDemo('shop')} className="demo-btn">🏪 Shop</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><div className="spinner-sm" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
