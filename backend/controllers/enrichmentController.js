const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Attribute = require('../models/attributeModel');
const aiService = require('../services/aiService');

// Enrich selected products
router.post('/', async (req, res) => {
  try {
    const productIds = req.body.map((product) => product._id);

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }
    
    // Update status to in_progress
    await Product.updateMany(
      { _id: { $in: productIds } },
      { 
        $set: { 
          enrichmentStatus: 'in_progress',
          lastEnriched: new Date()
        } 
      }
    );
    // Initialize enrichment process
    // For large batches, this would be queued in a job system
    // This implementation processes up to 5 products immediately and queues the rest
    const processNow = productIds.slice(0, 5);
    const queueRest = productIds.slice(5);
    
    // Process the first 5 immediately - send as response
    const products = await Product.find({ _id: { $in: processNow } });
    const attributes = await Attribute.find({ 'enrichment.enabled': true })
                                     .sort({ 'enrichment.priority': -1 });
    
    // Process each product
    const enrichmentResults = await Promise.all(
      products.map(async (product) => {
        try {
          const enriched = await aiService.enrichProduct(product, attributes);
          return {
            productId: product._id,
            status: 'completed',
            enrichedFields: Object.keys(enriched).length
          };
        } catch (error) {
          console.error(`Error enriching product ${product._id}:`, error);
          return {
            productId: product._id,
            status: 'failed',
            error: error.message
          };
        }
      })
    );
    
    // Queue remaining products for background processing
    if (queueRest.length > 0) {
      // In a real implementation, this would use a job queue like Bull or AWS SQS
      // For simplicity, we'll just log it and process asynchronously
      console.log(`Queued ${queueRest.length} products for background enrichment`);
      
      // Process in background without waiting
      setTimeout(async () => {
        try {
          const queuedProducts = await Product.find({ _id: { $in: queueRest } });
          
          for (const product of queuedProducts) {
            try {
              await aiService.enrichProduct(product, attributes);
              await Product.findByIdAndUpdate(
                product._id,
                { enrichmentStatus: 'completed' }
              );
            } catch (error) {
              console.error(`Error in background enrichment for product ${product._id}:`, error);
              await Product.findByIdAndUpdate(
                product._id,
                { enrichmentStatus: 'failed' }
              );
            }
          }
        } catch (error) {
          console.error('Error in background enrichment job:', error);
        }
      }, 100);
    }
    
    res.json({
      message: 'Enrichment process started',
      processed: enrichmentResults,
      queued: queueRest.length
    });
  } catch (error) {
    console.error('Error starting enrichment process:', error);
    res.status(500).json({ error: 'Failed to start enrichment process' });
  }
});

module.exports = router;