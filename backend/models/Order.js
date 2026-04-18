const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  tokenNumber: { type: Number },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  specialInstructions: { type: String, default: '' },
  estimatedTime: { type: Number, default: 15 }, // minutes
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

// Auto-generate token number per shop per day
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await mongoose.model('Order').countDocuments({
      shop: this.shop,
      createdAt: { $gte: today }
    });
    this.tokenNumber = count + 1;
    this.statusHistory.push({ status: 'pending', note: 'Order placed' });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
