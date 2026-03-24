const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  gstNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
