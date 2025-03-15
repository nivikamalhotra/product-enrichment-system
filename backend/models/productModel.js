const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Dynamic field schema for attributes
const DynamicFieldSchema = new Schema({
  value: Schema.Types.Mixed,
  unit: String
}, { _id: false });

// Product Schema
const ProductSchema = new Schema({
  name: { type: String, required: true, index: true },
  brand: { type: String, index: true },
  barcode: { type: String, index: true },
  status: { 
    type: String, 
    enum: ['Active', 'Draft', 'Archived', 'Out of Stock'], 
    default: 'Draft' 
  },
  category: { 
    type: String, 
    enum: ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Books', 'Toys']
  },
  price: { type: Number },
  images: [{ type: String }],
  attributes: { type: Map, of: DynamicFieldSchema, default: {} },
  importBatch: { type: String, index: true },
  importDate: { type: Date, default: Date.now },
  lastEnriched: { type: Date },
  enrichmentStatus: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'failed'], 
    default: 'pending' 
  }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;