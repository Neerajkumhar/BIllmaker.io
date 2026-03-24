const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'Other'], default: 'Bank Transfer' },
  referenceId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
