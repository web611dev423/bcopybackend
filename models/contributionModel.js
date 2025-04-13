const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: {
    java: String,
    python: String,
    html: String,
  },
  type: {
    type: String,
    requied: true,
  },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Contributor' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  // approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', contributionSchema); 