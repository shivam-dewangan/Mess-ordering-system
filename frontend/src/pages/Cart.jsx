import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
  const { cart, cartShopId, addToCart, removeFromCart, deleteFromCart, clearCart, cartTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/orders', {
        shopId: cartShopId,
        items: cart,
        paymentMethod,
        specialInstructions
      });
      clearCart();
      toast.success(`Order placed! Token #${res.data.tokenNumber}`);
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (cart.length === 0) return (
    <div className="cart-page">
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Cart is empty</h3>
          <p>Add items from a shop to place an order</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Shops</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="page-container">
        <h1 className="page-title">Your Cart</h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-section">
            <div className="card">
              <h3 className="section-title">Order Items</h3>
              {cart.map(item => (
                <div key={item.menuItemId} className="cart-item-row">
                  <div className="cir-info">
                    <span className="cir-name">{item.name}</span>
                    <span className="cir-price">₹{item.price} each</span>
                  </div>
                  <div className="cir-controls">
                    <div className="qty-control" style={{ width: 'auto' }}>
                      <button className="qty-btn" onClick={() => removeFromCart(item.menuItemId)}>−</button>
                      <span style={{ padding: '0 12px' }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => addToCart({ _id: item.menuItemId, name: item.name, price: item.price }, cartShopId)}>+</button>
                    </div>
                    <span className="cir-subtotal">₹{item.price * item.quantity}</span>
                    <button className="delete-btn" onClick={() => deleteFromCart(item.menuItemId)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions */}
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="section-title">Special Instructions</h3>
              <textarea
                placeholder="Any special requests? (e.g., less spicy, no onion)"
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="card">
              <h3 className="section-title">Order Summary</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <h4 className="section-title" style={{ marginTop: 20, marginBottom: 12 }}>Payment Method</h4>
              <div className="payment-options">
                {['cash', 'upi', 'card'].map(method => (
                  <label key={method} className={`payment-opt ${paymentMethod === method ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} hidden />
                    <span>{method === 'cash' ? '💵' : method === 'upi' ? '📱' : '💳'}</span>
                    <span>{method.toUpperCase()}</span>
                  </label>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 20 }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? <><div className="spinner-sm" /> Placing Order...</> : `Place Order • ₹${cartTotal}`}
              </button>

              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
