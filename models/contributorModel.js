const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "contributor@example.com"
  },
  profileLink: {
    type: String,
    default: "https://contributor.me"
  },
  country: {
    type: String,
    required: true,
  },
  contributions: {
    type: Number,
    required: true,
    default: 0,
  },
  image: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model("Contributor", contributorSchema);