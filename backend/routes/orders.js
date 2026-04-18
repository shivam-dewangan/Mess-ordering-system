const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');

// Place order (student)
router.post('/', protect, async (req, res) => {
  try {
    const { shopId, items, paymentMethod, specialInstructions } = req.body;

    // Build order items with current prices
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ message: `Item ${item.name} is not available` });
      }
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
      totalAmount += menuItem.price * item.quantity;
    }

    const order = await Order.create({
      student: req.user._id,
      shop: shopId,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions: specialInstructions || '',
    });

    await order.populate(['student', 'shop']);

    // Emit socket event to admin room
    const io = req.app.get('io');
    io.to(`shop_${shopId}`).emit('new_order', order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('shop', 'name category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(['student', 'shop']);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get shop orders (admin)
router.get('/shop/:shopId', protect, adminOnly, async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = { shop: req.params.shopId };
    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }
    const orders = await Order.find(query)
      .populate('student', 'name rollNumber phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('student', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (status === 'paid') order.paymentStatus = 'paid';
    await order.save();

    // Emit socket update to student
    const io = req.app.get('io');
    io.to(`student_${order.student._id}`).emit('order_updated', order);
    io.to(`shop_${order.shop}`).emit('order_status_changed', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel order (student)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by student' });
    await order.save();

    const io = req.app.get('io');
    io.to(`shop_${order.shop}`).emit('order_cancelled', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
