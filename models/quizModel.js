const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [{
    id: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true }, // 'multiple' or 'boolean'
    difficulty: { type: String, required: true }, // 'easy', 'medium', 'hard'
    question: { type: String, required: true },
    correct_answer: { type: String, required: true },
    incorrect_answers: [{ type: String }]
  }],
  mode: {
    type: String,
    required: true,
    enum: ['direct', 'group', 'solo']
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending'
    },
    result: {
      score: { type: Number },
      totalQuestions: { type: Number },
      startedAt: { type: Date },
      completedAt: { type: Date },
      timeElapsedMs: { type: Number }
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: false, // We're manually handling createdAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Indexes for better query performance
quizSchema.index({ creatorId: 1 });
quizSchema.index({ 'participants.userId': 1 });
quizSchema.index({ createdAt: 1 });
quizSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // For automatic expiration if needed

module.exports = mongoose.model("Quiz", quizSchema);