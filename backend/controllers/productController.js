const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const { upload, parseFile, uploadImage } = require('../middleware/upload');

// Get all products with pagination, sorting, and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Filters
    const filter = {};
    Object.keys(req.query).forEach(key => {
      if (!['page', 'limit', 'sort', 'order'].includes(key)) {
        filter[key] = { $regex: req.query[key], $options: 'i' };
      }
    });

    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    res.json({ products, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Import products from CSV/Excel
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const data = parseFile(req.file.path);
    if (!data.length) return res.status(400).json({ error: 'File contains no data' });

    const products = data.map(item => ({
      name: item.Name || '',
      brand: item.Brand || '',
      barcode: item.Barcode || '',
      images: item.Image ? item.Image.split(',').map(img => img.trim()) : []
    }));

    const result = await Product.insertMany(products);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to import products' });
  }
});

// Get a product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Update a product
router.put('/:id', uploadImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    // If images are uploaded, save file paths
    if (req?.file) {
      updatedData.images = [`uploads/image/${req.file.filename}`];
    }
    const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Add a new product
router.post('/', async (req, res) => {
  try {
    const { name, brand, barcode, images, attributes, price, category, status } = req.body;

    // Validate required fields
    if (!name || !barcode) {
      return res.status(400).json({ error: 'Name and barcode are required' });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      brand: brand || '',
      barcode,
      images: images || [],
      attributes: attributes || {},
      price: price,
      category: category,
      status: status
    });

    // Save to database
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

module.exports = router;
