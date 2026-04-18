import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Admin.css';

const EMPTY_FORM = { name: '', description: '', price: '', category: 'other', prepTime: '10', isVeg: true, isAvailable: true };

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts', 'other'];

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();
  const shopId = user?.shopId?._id || user?.shopId;

  useEffect(() => {
    if (!shopId) return;
    axios.get(`/api/menu/shop/${shopId}`)
      .then(res => setItems(res.data))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [shopId]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, prepTime: item.prepTime, isVeg: item.isVeg, isAvailable: item.isAvailable });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), prepTime: Number(form.prepTime) };
      if (editItem) {
        const res = await axios.put(`/api/menu/${editItem._id}`, payload);
        setItems(prev => prev.map(i => i._id === editItem._id ? res.data : i));
        toast.success('Item updated!');
      } else {
        const res = await axios.post('/api/menu', payload);
        setItems(prev => [...prev, res.data]);
        toast.success('Item added!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const toggleAvail = async (item) => {
    try {
      const res = await axios.put(`/api/menu/${item._id}/toggle`);
      setItems(prev => prev.map(i => i._id === item._id ? res.data : i));
      toast.success(res.data.isAvailable ? 'Item enabled' : 'Item disabled');
    } catch { toast.error('Failed to toggle'); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/menu/${itemId}`);
      setItems(prev => prev.filter(i => i._id !== itemId));
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
  };

  const cats = ['all', ...CATEGORIES.filter(c => items.some(i => i.category === c))];
  const filtered = activeFilter === 'all' ? items : items.filter(i => i.category === activeFilter);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="page-container">
        <div className="admin-header">
          <h1 className="page-title">Menu Management</h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
        </div>

        <div className="orders-filter-bar" style={{ marginBottom: 20 }}>
          {cats.map(c => (
            <button key={c} className={`filter-btn ${activeFilter === c ? 'active' : ''}`} onClick={() => setActiveFilter(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                {c === 'all' ? items.length : items.filter(i => i.category === c).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No items yet</h3>
            <p>Add your first menu item</p>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
          </div>
        ) : (
          <div className="menu-admin-grid">
            {filtered.map(item => (
              <div key={item._id} className={`menu-admin-card fade-in ${!item.isAvailable ? 'unavail' : ''}`}>
                <div className="mac-top">
                  <div>
                    <div className="mac-name">{item.name}</div>
                    <div className="mac-desc">{item.description || '—'}</div>
                  </div>
                  <div className="mac-price">₹{item.price}</div>
                </div>
                <div className="mac-tags">
                  <span className="mac-tag">{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                  <span className="mac-tag">{item.category}</span>
                  <span className="mac-tag">⏱ {item.prepTime}m</span>
                  <span className={`mac-tag`} style={{ color: item.isAvailable ? 'var(--green)' : 'var(--red)' }}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="mac-actions">
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => openEdit(item)}>✏️ Edit</button>
                  <button className={`btn ${item.isAvailable ? 'btn-ghost' : 'btn-success'}`} style={{ fontSize: 12 }} onClick={() => toggleAvail(item)}>
                    {item.isAvailable ? '🚫 Disable' : '✅ Enable'}
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: 12, flex: '0 0 auto', padding: '7px 12px' }} onClick={() => deleteItem(item._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header">
              <h3>{editItem ? 'Edit Item' : 'Add Menu Item'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Item Name *</label>
                <input placeholder="e.g. Aloo Paratha" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" min="0" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Prep Time (min)</label>
                  <input type="number" min="1" value={form.prepTime} onChange={e => setForm({ ...form, prepTime: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <div className="veg-toggle">
                  <button type="button" className={`veg-opt ${form.isVeg ? 'active-veg' : ''}`} onClick={() => setForm({ ...form, isVeg: true })}>🟢 Veg</button>
                  <button type="button" className={`veg-opt ${!form.isVeg ? 'active-nonveg' : ''}`} onClick={() => setForm({ ...form, isVeg: false })}>🔴 Non-Veg</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner-sm" /> Saving...</> : (editItem ? 'Save Changes' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
