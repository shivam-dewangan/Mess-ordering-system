import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUSES = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

const NEXT_LABEL = {
  pending: '✅ Confirm',
  confirmed: '👨‍🍳 Start Preparing',
  preparing: '🔔 Mark Ready',
  ready: '🎉 Complete',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const shopId = user?.shopId?._id || user?.shopId;

  const fetchOrders = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(`/api/orders/shop/${shopId}?date=${today}`);
      setOrders(res.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    fetchOrders();
    const socket = io('/', { withCredentials: true });
    socket.emit('join_room', `shop_${shopId}`);
    socket.on('new_order', (order) => {
      toast.success(`🔔 New order! Token #${order.tokenNumber}`);
      setOrders(prev => [order, ...prev]);
    });
    socket.on('order_cancelled', fetchOrders);
    return () => socket.disconnect();
  }, [shopId, fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="page-container">
        <h1 className="page-title">Orders — Today</h1>

        {/* Filter Tabs */}
        <div className="orders-filter-bar">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {counts[s] > 0 && <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>{counts[s]}</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No {filter === 'all' ? '' : filter} orders</h3>
            <p>Orders will appear here in real-time</p>
          </div>
        ) : filtered.map(order => (
          <div key={order._id} className={`admin-order-card fade-in`}>
            <div className="aoc-header">
              <div>
                <div className="aoc-token">Token #{order.tokenNumber}</div>
                <div className="aoc-student">{order.student?.name}</div>
                <div className="aoc-roll">{order.student?.rollNumber} · {order.student?.phone}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className={`badge badge-${order.status}`}>{order.status}</span>
                <span className="aoc-meta">{new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="aoc-items">
              {order.items.map((item, i) => (
                <span key={i} className="aoc-item-tag">{item.name} ×{item.quantity}</span>
              ))}
            </div>

            {order.specialInstructions && (
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, padding: '6px 10px', background: 'var(--bg2)', borderRadius: 6 }}>
                📝 {order.specialInstructions}
              </div>
            )}

            <div className="aoc-footer">
              <div>
                <div className="aoc-amount">₹{order.totalAmount}</div>
                <div className="aoc-meta">{order.paymentMethod?.toUpperCase()} · {order.paymentStatus}</div>
              </div>
              <div className="status-actions">
                {NEXT_STATUS[order.status] && (
                  <button
                    className="status-action-btn active-action"
                    onClick={() => updateStatus(order._id, NEXT_STATUS[order.status])}
                  >
                    {NEXT_LABEL[order.status]}
                  </button>
                )}
                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    className="status-action-btn cancel-action"
                    onClick={() => updateStatus(order._id, 'cancelled')}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
