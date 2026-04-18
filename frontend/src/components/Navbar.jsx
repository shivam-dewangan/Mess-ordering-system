import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user.role === 'admin' ? '/admin' : '/'} className="navbar-brand">
          <span className="brand-icon">🍱</span>
          <span className="brand-text">CampusEats</span>
        </Link>

        <div className="navbar-links">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Dashboard</Link>
              <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>Orders</Link>
              <Link to="/admin/menu" className={location.pathname === '/admin/menu' ? 'active' : ''}>Menu</Link>
            </>
          ) : (
            <>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Shops</Link>
              <Link to="/my-orders" className={location.pathname === '/my-orders' ? 'active' : ''}>My Orders</Link>
            </>
          )}
        </div>

        <div className="navbar-right">
          {user.role === 'student' && (
            <Link to="/cart" className="cart-btn">
              <span>🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user.name?.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}
