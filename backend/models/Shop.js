const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['mess', 'cafe', 'snacks', 'beverages', 'other'], default: 'mess' },
  image: { type: String, default: '' },
  isOpen: { type: Boolean, default: true },
  openingTime: { type: String, default: '08:00' },
  closingTime: { type: String, default: '22:00' },
  location: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
