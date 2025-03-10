require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const attributeRoutes = require('./controllers/attributeController');
const enrichmentRoutes = require('./controllers/enrichmentController');
const productRoutes = require('./controllers/productController');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/enrichment', enrichmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;