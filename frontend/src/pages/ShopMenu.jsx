import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ShopMenu.css';

const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts', 'other'];

export default function ShopMenu() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart, cartCount, cartTotal, cartShopId } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get(`/api/shops/${shopId}`),
      axios.get(`/api/menu/shop/${shopId}`)
    ]).then(([shopRes, menuRes]) => {
      setShop(shopRes.data);
      setMenu(menuRes.data);
    }).catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [shopId]);

  const getQty = (itemId) => cart.find(i => i.menuItemId === itemId)?.quantity || 0;

  const filtered = activeCategory === 'all' ? menu : menu.filter(i => i.category === activeCategory);
  const availableCats = categories.filter(c => c === 'all' || menu.some(i => i.category === c));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="menu-page">
      <div className="page-container">
        {/* Shop Header */}
        <div className="shop-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <div className="shop-header-info">
            <h1>{shop?.name}</h1>
            <div className="shop-header-meta">
              <span className={`shop-status ${shop?.isOpen ? 'open' : 'closed'}`}>
                {shop?.isOpen ? '● Open Now' : '● Closed'}
              </span>
              <span>📍 {shop?.location}</span>
              <span>🕐 {shop?.openingTime} – {shop?.closingTime}</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {availableCats.map(cat => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="menu-layout">
          <div className="menu-grid">
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>No items in this category</p>
              </div>
            ) : filtered.map(item => {
              const qty = getQty(item._id);
              return (
                <div key={item._id} className={`menu-item-card ${!item.isAvailable ? 'unavailable' : ''}`}>
                  <div className="item-top">
                    <span className={`veg-badge ${item.isVeg ? 'veg' : 'nonveg'}`}>
                      {item.isVeg ? '🟢' : '🔴'}
                    </span>
                    {!item.isAvailable && <span className="sold-out-tag">Sold Out</span>}
                  </div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="item-meta">
                      <span className="item-price">₹{item.price}</span>
                      <span className="item-time">⏱ {item.prepTime} min</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    {!item.isAvailable ? (
                      <button className="btn" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.4 }}>Unavailable</button>
                    ) : qty === 0 ? (
                      <button className="btn btn-primary add-btn" onClick={() => { addToCart(item, shopId); toast.success(`${item.name} added!`); }}>
                        + Add
                      </button>
                    ) : (
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => removeFromCart(item._id)}>−</button>
                        <span>{qty}</span>
                        <button className="qty-btn" onClick={() => addToCart(item, shopId)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Sidebar on desktop */}
          {cartCount > 0 && cartShopId === shopId && (
            <div className="cart-sidebar">
              <h3>Your Order</h3>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.menuItemId} className="cart-sidebar-item">
                    <span className="ci-name">{item.name}</span>
                    <span className="ci-qty">×{item.quantity}</span>
                    <span className="ci-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="cart-sidebar-total">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/cart')}>
                Proceed to Checkout →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Bar (mobile) */}
      {cartCount > 0 && cartShopId === shopId && (
        <div className="floating-cart" onClick={() => navigate('/cart')}>
          <div className="fc-left">
            <span className="fc-count">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            <span className="fc-sep">|</span>
            <span className="fc-shop">{shop?.name}</span>
          </div>
          <div className="fc-right">
            <span>₹{cartTotal}</span>
            <span>View Cart →</span>
          </div>
        </div>
      )}
    </div>
  );
}
