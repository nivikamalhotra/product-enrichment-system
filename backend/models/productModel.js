const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Dynamic field schema for attributes
const DynamicFieldSchema = new Schema({
  value: Schema.Types.Mixed,
  unit: String
}, { _id: false });

// Product Schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    index: true
  },
  barcode: {
    type: String,
    index: true
  },
  images: [{
    type: String
  }],
  // Dynamic attributes - will store all custom attributes
  attributes: {
    type: Map,
    of: DynamicFieldSchema,
    default: {}
  },
  importBatch: {
    type: String,
    index: true
  },
  importDate: {
    type: Date,
    default: Date.now
  },
  lastEnriched: {
    type: Date
  },
  enrichmentStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ 'attributes.value': 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ updatedAt: -1 });

// Method to get attribute value
ProductSchema.methods.getAttributeValue = function(attributeKey) {
  if (this.attributes.has(attributeKey)) {
    const attr = this.attributes.get(attributeKey);
    if (attr.unit) {
      return `${attr.value} ${attr.unit}`;
    }
    return attr.value;
  }
  return null;
};

// Method to set attribute value
ProductSchema.methods.setAttributeValue = function(attributeKey, value, unit = null) {
  this.attributes.set(attributeKey, { value, unit });
};

// Create and export the model
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;