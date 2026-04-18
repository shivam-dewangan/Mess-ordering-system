import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './MyOrders.css';

const STATUS_INFO = {
  pending: { icon: '⏳', color: 'yellow' },
  confirmed: { icon: '✅', color: 'blue' },
  preparing: { icon: '👨‍🍳', color: 'accent' },
  ready: { icon: '🔔', color: 'green' },
  completed: { icon: '🎉', color: 'green' },
  cancelled: { icon: '❌', color: 'red' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/orders/my-orders')
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="myorders-page">
      <div className="page-container">
        <h1 className="page-title">My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Order Now</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const info = STATUS_INFO[order.status] || STATUS_INFO.pending;
              return (
                <div key={order._id} className="order-card fade-in" onClick={() => navigate(`/order/${order._id}`)}>
                  <div className="oc-left">
                    <div className={`oc-status-icon status-bg-${info.color}`}>{info.icon}</div>
                    <div className="oc-details">
                      <h4>{order.shop?.name}</h4>
                      <p>{order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
                      <span className="oc-time">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="oc-right">
                    <span className="oc-amount">₹{order.totalAmount}</span>
                    <span className={`badge badge-${order.status}`}>#{order.tokenNumber} · {order.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
