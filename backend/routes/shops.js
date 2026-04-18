const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { protect, adminOnly } = require('../middleware/auth');

// Get all shops
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'name email');
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single shop
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle shop open/close
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.isOpen = !shop.isOpen;
    await shop.save();
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update shop
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
