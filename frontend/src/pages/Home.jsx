import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Home.css';

const categoryEmoji = { mess: '🍛', cafe: '☕', snacks: '🍿', beverages: '🥤', other: '🏪' };

export default function Home() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/shops')
      .then(res => setShops(res.data))
      .catch(() => toast.error('Failed to load shops'))
      .finally(() => setLoading(false));
  }, []);

  const handleSeed = async () => {
    try {
      const res = await axios.post('/api/admin/seed');
      toast.success(res.data.message);
      const shopsRes = await axios.get('/api/shops');
      setShops(shopsRes.data);
    } catch (err) {
      toast.error('Seed failed');
    }
  };

  if (loading) return (
    <div className="center-page"><div className="spinner" /></div>
  );

  return (
    <div className="home-page">
      <div className="page-container">
        <div className="home-hero">
          <div>
            <h1 className="home-title">
              Hey {user.name.split(' ')[0]}, <br />
              <span>what are you craving?</span>
            </h1>
            <p className="home-subtitle">Order from campus mess & cafeterias — skip the queue</p>
          </div>
          <div className="home-stats">
            <div className="stat-pill">🏪 {shops.length} Shops</div>
            <div className="stat-pill">⚡ Skip Queue</div>
            <div className="stat-pill">📲 Live Tracking</div>
          </div>
        </div>

        {shops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>No shops yet</h3>
            <p>Seed sample data to get started</p>
            <button className="btn btn-primary" onClick={handleSeed}>Load Sample Data</button>
          </div>
        ) : (
          <>
            <div className="shops-seed-hint">
              <span>👇 First time? </span>
              <button className="seed-link" onClick={handleSeed}>Load sample shop & menu</button>
            </div>
            <div className="shops-grid">
              {shops.map(shop => (
                <div key={shop._id} className="shop-card fade-in" onClick={() => navigate(`/shop/${shop._id}`)}>
                  <div className="shop-card-header">
                    <div className="shop-emoji">{categoryEmoji[shop.category] || '🏪'}</div>
                    <span className={`shop-status ${shop.isOpen ? 'open' : 'closed'}`}>
                      {shop.isOpen ? '● Open' : '● Closed'}
                    </span>
                  </div>
                  <div className="shop-card-body">
                    <h3>{shop.name}</h3>
                    <p>{shop.description || 'Fresh food, great taste'}</p>
                    <div className="shop-meta">
                      <span>📍 {shop.location || 'Campus'}</span>
                      <span className="shop-category">{shop.category}</span>
                    </div>
                  </div>
                  <div className="shop-card-footer">
                    <span className="shop-timing">🕐 {shop.openingTime} – {shop.closingTime}</span>
                    <button className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                      Order Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
