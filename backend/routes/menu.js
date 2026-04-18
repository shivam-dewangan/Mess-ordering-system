const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');

// Get menu by shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const items = await MenuItem.find({ shop: req.params.shopId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add menu item (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create({ ...req.body, shop: req.user.shopId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update menu item (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle availability
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete menu item (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
