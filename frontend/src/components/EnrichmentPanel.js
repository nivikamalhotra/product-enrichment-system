import React, { useState } from 'react';
import { enrichProductsWithAI } from '../services/api';

const EnrichmentPanel = ({ selectedProducts, onEnrich }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnrich = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to enrich.');
      return;
    }

    setIsLoading(true);
    try {
      // const attributeKeys = attributes.map(attr => attr.key);
      const enrichedProducts = await enrichProductsWithAI(selectedProducts);

      if (!Array.isArray(enrichedProducts) || enrichedProducts.length === 0) {
        throw new Error("No products were enriched.");
      }

      onEnrich(enrichedProducts); // Send enriched data to ProductList.js
      alert(`Successfully enriched ${enrichedProducts.length} products`);
    } catch (error) {
      console.error('Error enriching products:', error);
      alert(`Enrichment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button  className="primary-btn" onClick={handleEnrich} disabled={isLoading || selectedProducts.length === 0}>
    {isLoading ? 'Enriching...' : 'Enrich Now'}
  </button>
  );
};

export default EnrichmentPanel;
