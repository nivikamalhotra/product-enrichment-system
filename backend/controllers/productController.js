const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Attribute = require('../models/attributeModel');
const { upload, parseFile } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Get products with pagination, sorting, and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract sort parameters
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = {};
    
    // Handle sorting by attributes
    if (sortField.startsWith('attributes.')) {
      const attributeKey = sortField.split('.')[1];
      sort[`attributes.${attributeKey}.value`] = sortOrder;
    } else {
      sort[sortField] = sortOrder;
    }
    
    // Build filter query
    const filter = {};
    
    // Get all possible filter keys from query
    Object.keys(req.query).forEach(key => {
      // Skip pagination, sorting, and common params
      if (['page', 'limit', 'sort', 'order'].includes(key)) return;
      
      // Handle standard fields
      if (['name', 'brand', 'barcode'].includes(key)) {
        filter[key] = { $regex: req.query[key], $options: 'i' };
      }
      
      // Handle attribute filters
      if (key.startsWith('attr.')) {
        const attributeKey = key.replace('attr.', '');
        filter[`attributes.${attributeKey}.value`] = req.query[key];
      }
    });
    
    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Import products from file
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const data = parseFile(filePath);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'File contains no data' });
    }

    // Get all attributes to validate against
    const attributes = await Attribute.find({});
    const attributeKeys = attributes.map(attr => attr.key);

    // Generate batch ID for this import
    const batchId = `batch-${Date.now()}`;
    
    // Map data to product model
    const products = data.map(item => {
      const product = {
        name: item.name || item.Name || item.product_name || item.ProductName || '',
        brand: item.brand || item.Brand || '',
        barcode: item.barcode || item.Barcode || item.upc || item.UPC || '',
        images: [],
        attributes: {},
        importBatch: batchId
      };

      // Handle images
      if (item.image || item.Image || item.images || item.Images) {
        const imageField = item.image || item.Image || item.images || item.Images;
        if (typeof imageField === 'string') {
          product.images = imageField.split(',').map(url => url.trim());
        } else if (Array.isArray(imageField)) {
          product.images = imageField;
        }
      }

      // Convert attributes
      const productAttributes = {};
      Object.keys(item).forEach(key => {
        // Skip standard fields
        if (['name', 'Name', 'brand', 'Brand', 'barcode', 'Barcode', 'upc', 'UPC', 'image', 'Image', 'images', 'Images'].includes(key)) {
          return;
        }
        
        // Try to match with defined attributes or create dynamic ones
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
        if (attributeKeys.includes(normalizedKey)) {
          productAttributes[normalizedKey] = { value: item[key] };
        }
      });

      return {
        ...product,
        attributes: productAttributes
      };
    });

    // Insert products into database
    const result = await Product.insertMany(products);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: `Successfully imported ${result.length} products`,
      batchId,
      count: result.length
    });
  } catch (error) {
    console.error('Error importing products:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to import products' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { attributes, ...productData } = req.body;
    
    // Get existing product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update standard fields
    Object.keys(productData).forEach(key => {
      if (key !== '_id' && key !== 'attributes') {
        product[key] = productData[key];
      }
    });
    
    // Update attributes
    if (attributes) {
      Object.keys(attributes).forEach(key => {
        product.setAttributeValue(key, attributes[key].value, attributes[key].unit);
      });
    }
    
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Batch delete products
router.post('/delete-batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }
    
    const result = await Product.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: `Successfully deleted ${result.deletedCount} products`,
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Error batch deleting products:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

module.exports = router;