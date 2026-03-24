const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  serviceType: { type: String, required: true }, // e.g., 'Web Development'
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'], default: 'Not Started' },
  deadline: { type: Date },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
