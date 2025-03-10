const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Attribute Schema
const AttributeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['short_text', 'long_text', 'rich_text', 'number', 'single_select', 'multi_select', 'measure']
  },
  required: {
    type: Boolean,
    default: false
  },
  // For select types, store the available options
  options: [{
    type: String
  }],
  // For measure type, store the unit (e.g., USD, kg, cm)
  unit: {
    type: String
  },
  // AI enrichment settings
  enrichment: {
    enabled: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: 5
    },
    prompt: {
      type: String
    }
  },
  // Display settings
  display: {
    showInList: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  // Validation
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    regex: String
  }
}, { 
  timestamps: true 
});

// Create index for faster lookup
AttributeSchema.index({ key: 1 });
AttributeSchema.index({ 'display.order': 1 });

const Attribute = mongoose.model('Attribute', AttributeSchema);
module.exports = Attribute;