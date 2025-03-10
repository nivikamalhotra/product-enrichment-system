const express = require('express');
const router = express.Router();
const Attribute = require('../models/attributeModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// Get all attributes
router.get('/', async (req, res) => {
  try {
    const attributes = await Attribute.find().sort({ 'display.order': 1 });
    res.json(attributes);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
});

// Get a single attribute by ID
router.get('/:id', async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    res.json(attribute);
  } catch (error) {
    console.error('Error fetching attribute:', error);
    res.status(500).json({ error: 'Failed to fetch attribute' });
  }
});

// Create a new attribute
router.post('/', async (req, res) => {
  try {
    // Generate key from name if not provided
    if (!req.body.key && req.body.name) {
      req.body.key = req.body.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    }
    
    // Validate required fields
    if (!req.body.name || !req.body.type) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['name', 'type'] 
      });
    }
    
    // Check if key already exists
    const existingAttribute = await Attribute.findOne({ key: req.body.key });
    if (existingAttribute) {
      return res.status(409).json({ error: 'Attribute key already exists' });
    }
    
    // Create the attribute
    const attribute = new Attribute(req.body);
    await attribute.save();
    
    // If this is a required attribute, update all products to have this attribute with null value
    if (req.body.required) {
      await Product.updateMany(
        {}, 
        { $set: { [`attributes.${req.body.key}`]: { value: null } } }
      );
    }
    
    res.status(201).json(attribute);
  } catch (error) {
    console.error('Error creating attribute:', error);
    res.status(500).json({ error: 'Failed to create attribute' });
  }
});

// Update an attribute
router.put('/:id', async (req, res) => {
  try {
    // Get existing attribute
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    const oldKey = attribute.key;
    const newKey = req.body.key;
    
    // Check if key is being changed and if it already exists
    if (newKey && newKey !== oldKey) {
      const existingAttribute = await Attribute.findOne({ key: newKey });
      if (existingAttribute) {
        return res.status(409).json({ error: 'Attribute key already exists' });
      }
    }
    
    // Update the attribute
    Object.keys(req.body).forEach(key => {
      attribute[key] = req.body[key];
    });
    
    await attribute.save();
    
    // If key has changed, update all products with this attribute
    if (newKey && newKey !== oldKey) {
      // Find all products with this attribute
      const products = await Product.find({ [`attributes.${oldKey}`]: { $exists: true } });
      
      // Update each product
      for (const product of products) {
        if (product.attributes.has(oldKey)) {
          const value = product.attributes.get(oldKey);
          product.attributes.set(newKey, value);
          product.attributes.delete(oldKey);
          await product.save({ session });
        }
      }
    }
    
    res.json(attribute);
  } catch (error) {
    console.error('Error updating attribute:', error);
    res.status(500).json({ error: 'Failed to update attribute' });
  }
});

// Delete an attribute
router.delete('/:id', async (req, res) => {
  try {
    // Get attribute to delete
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    const key = attribute.key;
    
    // Delete the attribute
    await Attribute.findByIdAndDelete(req.params.id, { session });
    
    // Remove this attribute from all products
    await Product.updateMany(
      {}, 
      { $unset: { [`attributes.${key}`]: "" } }
    );
    
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
});

module.exports = router;