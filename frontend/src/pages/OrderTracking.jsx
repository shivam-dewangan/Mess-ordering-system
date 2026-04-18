import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './OrderTracking.css';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

const STATUS_INFO = {
  pending: { icon: '⏳', label: 'Order Placed', desc: 'Waiting for shop to confirm', color: 'yellow' },
  confirmed: { icon: '✅', label: 'Confirmed', desc: 'Shop has accepted your order', color: 'blue' },
  preparing: { icon: '👨‍🍳', label: 'Preparing', desc: 'Your food is being cooked', color: 'accent' },
  ready: { icon: '🔔', label: 'Ready!', desc: 'Come pick up your order', color: 'green' },
  completed: { icon: '🎉', label: 'Completed', desc: 'Enjoy your meal!', color: 'green' },
  cancelled: { icon: '❌', label: 'Cancelled', desc: 'Order was cancelled', color: 'red' },
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));

    const socket = io('/', { withCredentials: true });
    socket.emit('join_room', `student_${user._id}`);
    socket.on('order_updated', (updated) => {
      if (updated._id === orderId) {
        setOrder(updated);
        const info = STATUS_INFO[updated.status];
        toast.success(`${info?.icon} ${info?.label}`);
      }
    });
    return () => socket.disconnect();
  }, [orderId, user._id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await axios.put(`/api/orders/${orderId}/cancel`);
      setOrder(res.data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!order) return <div className="page-container" style={{ padding: '40px 20px' }}><p>Order not found</p></div>;

  const info = STATUS_INFO[order.status] || STATUS_INFO.pending;
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="tracking-page">
      <div className="page-container">
        <button className="back-btn" onClick={() => navigate('/my-orders')}>← My Orders</button>

        {/* Status Hero */}
        <div className={`status-hero status-${info.color}`}>
          <div className="status-icon-big">{info.icon}</div>
          <h2>{info.label}</h2>
          <p>{info.desc}</p>
          <div className="token-badge">Token #{order.tokenNumber}</div>
        </div>

        {/* Progress Bar */}
        {order.status !== 'cancelled' && (
          <div className="progress-track">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`progress-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                <div className="progress-dot">
                  {i < stepIdx ? '✓' : i === stepIdx ? '●' : '○'}
                </div>
                <span>{STATUS_INFO[step].label}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`progress-line ${i < stepIdx ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="tracking-grid">
          {/* Order Details */}
          <div className="card fade-in">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Order Details</h3>
            <div className="order-shop-name">{order.shop?.name}</div>
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <span>{item.name}</span>
                  <span className="oir-qty">×{item.quantity}</span>
                  <span className="oir-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="order-total-row">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            {order.specialInstructions && (
              <div className="special-note">
                📝 {order.specialInstructions}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div>
            <div className="card fade-in">
              <h3 className="section-title" style={{ marginBottom: 16 }}>Info</h3>
              <div className="info-rows">
                <div className="info-row"><span>Payment</span><span className="badge badge-pending">{order.paymentMethod?.toUpperCase()}</span></div>
                <div className="info-row"><span>Placed at</span><span>{new Date(order.createdAt).toLocaleTimeString()}</span></div>
                <div className="info-row"><span>Date</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>

            {['pending', 'confirmed'].includes(order.status) && (
              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={handleCancel}>
                Cancel Order
              </button>
            )}

            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/')}>
              Order More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
