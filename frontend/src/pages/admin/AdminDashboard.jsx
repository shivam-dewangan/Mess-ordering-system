import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [shopOpen, setShopOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const shopId = user?.shopId?._id || user?.shopId;

  useEffect(() => {
    if (!shopId) return;
    fetchData();

    const socket = io('/', { withCredentials: true });
    socket.emit('join_room', `shop_${shopId}`);
    socket.on('new_order', (order) => {
      toast.success(`🔔 New order! Token #${order.tokenNumber}`);
      fetchData();
    });
    socket.on('order_cancelled', () => fetchData());
    return () => socket.disconnect();
  }, [shopId]);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [statsRes, ordersRes, shopRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get(`/api/orders/shop/${shopId}?date=${today}`),
        axios.get(`/api/shops/${shopId}`)
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
      setShopOpen(shopRes.data.isOpen);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleShop = async () => {
    try {
      const res = await axios.put(`/api/shops/${shopId}/toggle`);
      setShopOpen(res.data.isOpen);
      toast.success(res.data.isOpen ? '✅ Shop is now Open' : '🔴 Shop is now Closed');
    } catch (err) {
      toast.error('Failed to toggle shop status');
    }
  };

  const statusColor = { pending: 'yellow', confirmed: 'blue', preparing: 'accent', ready: 'green', completed: '', cancelled: 'red' };

  return (
    <div className="admin-page">
      <div className="page-container">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>{user?.shopId?.name || 'Your Shop'}</p>
          </div>
          <button
            className={`btn ${shopOpen ? 'btn-danger' : 'btn-success'}`}
            onClick={toggleShop}
          >
            {shopOpen ? '🔴 Close Shop' : '✅ Open Shop'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{stats?.todayOrders ?? '—'}</div>
            <div className="stat-label">Today's Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats?.pendingOrders ?? '—'}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{stats?.todayRevenue ?? '—'}</div>
            <div className="stat-label">Today's Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-value">{stats?.activeMenuItems ?? '—'}</div>
            <div className="stat-label">Active Menu Items</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="qa-btn" onClick={() => navigate('/admin/orders')}>
            <span>📋</span> Manage Orders
          </button>
          <button className="qa-btn" onClick={() => navigate('/admin/menu')}>
            <span>🍽️</span> Manage Menu
          </button>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>Today's Recent Orders</h3>
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => navigate('/admin/orders')}>View All</button>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>No orders yet today</p>
          ) : recentOrders.map(order => (
            <div key={order._id} className="recent-order-row">
              <div className="ror-token">#{order.tokenNumber}</div>
              <div className="ror-info">
                <span>{order.student?.name}</span>
                <span className="ror-items">{order.items.map(i => i.name).join(', ')}</span>
              </div>
              <div className="ror-right">
                <span className="ror-amount">₹{order.totalAmount}</span>
                <span className={`badge badge-${order.status}`}>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
