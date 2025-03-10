import React, { useState } from 'react';
import { enrichProducts } from '../services/api';

function EnrichmentPanel({ selectedProducts, attributes, onEnrichment }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleEnrichment = async () => {
    if (selectedProducts.length === 0) {
      setError("Please select products to enrich");
      return;
    }

    setIsEnriching(true);
    setError(null);
    setProgress(0);

    try {
      // For large product sets, simulate progress updates
      const totalProducts = selectedProducts.length;
      
      if (totalProducts > 10) {
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);
      }

      const productIds = selectedProducts.map(product => product.id);
      const attributeKeys = attributes.map(attr => attr.key);
      
      const enrichedProducts = await enrichProducts(productIds, attributeKeys);
      
      setProgress(100);
      onEnrichment(enrichedProducts);
      
    } catch (error) {
      console.error('Enrichment error:', error);
      setError(error.message || 'Failed to enrich products');
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="enrichment-panel">
      <h2>AI Enrichment</h2>
      
      {selectedProducts.length > 0 ? (
        <div className="enrichment-info">
          <p>{selectedProducts.length} products selected for enrichment</p>
          <p>Attributes to be enriched: {attributes.length}</p>
        </div>
      ) : (
        <div className="enrichment-info">
          <p>No products selected for enrichment</p>
          <p>Select products from the list to enable enrichment</p>
        </div>
      )}
      
      <button
        className="enrich-button"
        disabled={selectedProducts.length === 0 || isEnriching}
        onClick={handleEnrichment}
      >
        {isEnriching ? 'Enriching...' : 'Enrich Selected Products'}
      </button>
      
      {isEnriching && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="enrichment-info">
        <h3>How AI Enrichment Works</h3>
        <p>Our system uses advanced AI to analyze your product data and enrich it with detailed attributes:</p>
        <ul>
          <li>Product descriptions and features are generated from the product name and brand</li>
          <li>Technical specifications are extracted from available information</li>
          <li>Categories and tags are assigned based on product analysis</li>
          <li>Units and measurements are standardized</li>
        </ul>
        <p>The enrichment process can take a few seconds to a few minutes depending on the number of products.</p>
      </div>
    </div>
  );
}

export default EnrichmentPanel;