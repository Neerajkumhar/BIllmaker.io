const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  services: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    customName: { type: String }, // support custom naming
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  }],
  subtotal: { type: Number, required: true },
  gstIncluded: { type: Boolean, default: false },
  gstPercentage: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Overdue', 'Paid'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
