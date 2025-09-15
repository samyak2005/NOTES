const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  noteLimit: {
    type: Number,
    default: 3 // Free plan limit
  }
}, {
  timestamps: true
});

// Remove note limit for pro plan
tenantSchema.pre('save', function(next) {
  if (this.subscription === 'pro') {
    this.noteLimit = -1; // -1 means unlimited
  } else {
    this.noteLimit = 3;
  }
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);
