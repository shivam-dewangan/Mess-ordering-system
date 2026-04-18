const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Shop = require('../models/Shop');
const { protect, adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrders, totalRevenue, menuCount] = await Promise.all([
      Order.countDocuments({ shop: shopId, createdAt: { $gte: today } }),
      Order.countDocuments({ shop: shopId, status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.aggregate([
        { $match: { shop: shopId, status: 'completed', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      MenuItem.countDocuments({ shop: shopId, isAvailable: true })
    ]);

    res.json({
      todayOrders,
      pendingOrders,
      todayRevenue: totalRevenue[0]?.total || 0,
      activeMenuItems: menuCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed sample data
router.post('/seed', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Check if already seeded
    const existing = await User.findOne({ email: 'admin@campus.com' });
    if (existing) {
      return res.json({ message: 'Already seeded! Use admin@campus.com / admin123 and student@campus.com / student123' });
    }

    // Create admin
    const admin = await User.create({
      name: 'Mess Admin',
      email: 'admin@campus.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210'
    });

    // Create shop
    const shop = await Shop.create({
      name: 'Main Campus Mess',
      description: 'Serving fresh homestyle meals since 2010',
      category: 'mess',
      location: 'Block A, Ground Floor',
      isOpen: true,
      owner: admin._id
    });

    admin.shopId = shop._id;
    await admin.save();

    // Create menu items
    const menuItems = [
      { name: 'Aloo Paratha', price: 30, category: 'breakfast', isVeg: true, prepTime: 10, description: 'Crispy stuffed paratha with butter', shop: shop._id },
      { name: 'Poha', price: 20, category: 'breakfast', isVeg: true, prepTime: 5, description: 'Light & fluffy flattened rice', shop: shop._id },
      { name: 'Chai', price: 10, category: 'beverages', isVeg: true, prepTime: 3, description: 'Ginger cardamom tea', shop: shop._id },
      { name: 'Dal Rice', price: 50, category: 'lunch', isVeg: true, prepTime: 5, description: 'Yellow dal with steamed rice', shop: shop._id },
      { name: 'Rajma Chawal', price: 60, category: 'lunch', isVeg: true, prepTime: 5, description: 'Classic kidney beans curry', shop: shop._id },
      { name: 'Chicken Curry', price: 90, category: 'lunch', isVeg: false, prepTime: 10, description: 'Spicy home-style chicken', shop: shop._id },
      { name: 'Paneer Butter Masala', price: 80, category: 'dinner', isVeg: true, prepTime: 10, description: 'Rich creamy paneer curry', shop: shop._id },
      { name: 'Maggi', price: 25, category: 'snacks', isVeg: true, prepTime: 5, description: '2-minute noodles with masala', shop: shop._id },
      { name: 'Cold Coffee', price: 40, category: 'beverages', isVeg: true, prepTime: 3, description: 'Chilled coffee shake', shop: shop._id },
      { name: 'Gulab Jamun', price: 20, category: 'desserts', isVeg: true, prepTime: 2, description: 'Soft & sweet syrup balls', shop: shop._id },
    ];

    await MenuItem.insertMany(menuItems);

    // Create student
    await User.create({
      name: 'Rahul Sharma',
      email: 'student@campus.com',
      password: 'student123',
      role: 'student',
      rollNumber: 'CS2021001'
    });

    res.json({
      message: '✅ Sample data created!',
      credentials: {
        admin: 'admin@campus.com / admin123',
        student: 'student@campus.com / student123'
      },
      shopId: shop._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
