import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [tab, setTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const { register, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', rollNumber: '', phone: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', phone: '', shopName: '', shopCategory: 'mess', shopLocation: '' });

  const handleStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(studentForm);
      toast.success('Account created! Welcome!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerAdmin(adminForm);
      toast.success('Shop registered! Welcome!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob blob1" />
        <div className="auth-blob blob2" />
      </div>
      <div className="auth-card fade-in" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <span className="auth-logo">🍱</span>
          <h1>Create Account</h1>
          <p>Join CampusEats today</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'student' ? 'active' : ''}`} onClick={() => setTab('student')}>👨‍🎓 Student</button>
          <button className={`auth-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')}>👨‍🍳 Shop Owner</button>
        </div>

        {tab === 'student' ? (
          <form onSubmit={handleStudent} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input placeholder="Rahul Sharma" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input placeholder="CS2021001" value={studentForm.rollNumber} onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@campus.edu" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="9876543210" value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={studentForm.password} onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><div className="spinner-sm" /> Creating...</> : 'Create Student Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdmin} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input placeholder="Suresh Kumar" value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="9876543210" value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="owner@shop.com" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Shop Name</label>
              <input placeholder="Main Campus Mess" value={adminForm.shopName} onChange={e => setAdminForm({ ...adminForm, shopName: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={adminForm.shopCategory} onChange={e => setAdminForm({ ...adminForm, shopCategory: e.target.value })}>
                  <option value="mess">Mess</option>
                  <option value="cafe">Café</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input placeholder="Block A, GF" value={adminForm.shopLocation} onChange={e => setAdminForm({ ...adminForm, shopLocation: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><div className="spinner-sm" /> Creating...</> : 'Register Shop'}
            </button>
          </form>
        )}

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
