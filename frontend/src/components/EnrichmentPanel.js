import React, { useState } from 'react';
import { enrichProductsWithAI } from '../services/api';

const EnrichmentPanel = ({ selectedProducts, attributes, onEnrich }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnrich = async () => {
    setIsLoading(true);
    try {
      const enrichedProducts = await enrichProductsWithAI(selectedProducts);
      onEnrich(enrichedProducts);
    } catch (error) {
      console.error('Error enriching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="enrichment-panel">
      <h3>AI Enrichment</h3>
      <button onClick={handleEnrich} disabled={isLoading}>
        {isLoading ? 'Enriching...' : 'Enrich Now'}
      </button>
    </div>
  );
};

export default EnrichmentPanel;
