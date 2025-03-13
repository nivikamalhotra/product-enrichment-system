import React, { useState } from 'react';
import { enrichProducts } from '../services/api';

function EnrichmentPanel({ selectedProducts, attributes, onEnrich }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState(
    attributes.map(attr => attr.id || attr._id)
  );

  const handleAttributeToggle = (attributeId) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attributeId)) {
        return prev.filter(id => id !== attributeId);
      } else {
        return [...prev, attributeId];
      }
    });
  };

  const handleEnrichAll = async () => {
    if (selectedProducts.length === 0 || selectedAttributes.length === 0) {
      return;
    }
    
    setIsEnriching(true);
    setProgress(0);
    
    try {
      // Get the attribute keys for the selected attribute IDs
      const attributeKeys = attributes
        .filter(attr => selectedAttributes.includes(attr.id || attr._id))
        .map(attr => attr.key);
      
      // Get the product IDs
      const productIds = selectedProducts.map(product => product.id);
      
      // Mock progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Call the enrichment API
      const enrichedProducts = await enrichProducts(productIds, attributeKeys);
      
      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);
      
      // Notify parent component
      onEnrich(enrichedProducts);
      
      // Wait a moment to show 100% completion
      setTimeout(() => {
        setIsEnriching(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Enrichment failed:', error);
      setIsEnriching(false);
    }
  };

  return (
    <div className="enrichment-panel">
      <div className="enrichment-header">
        <h3>Enrich {selectedProducts.length} Selected Products</h3>
        <button className="close-panel" onClick={() => onEnrich([])}>×</button>
      </div>
      
      <div className="attributes-selection">
        <h4>Select Attributes to Enrich:</h4>
        <div className="attributes-list">
          <div className="attribute-item">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedAttributes.length === attributes.length}
              onChange={() => {
                if (selectedAttributes.length === attributes.length) {
                  setSelectedAttributes([]);
                } else {
                  setSelectedAttributes(attributes.map(attr => attr.id || attr._id));
                }
              }}
            />
            <label htmlFor="select-all">Select All</label>
          </div>
          
          {attributes.map(attr => (
            <div key={attr.id || attr._id} className="attribute-item">
              <input
                type="checkbox"
                id={`attr-${attr.id || attr._id}`}
                checked={selectedAttributes.includes(attr.id || attr._id)}
                onChange={() => handleAttributeToggle(attr.id || attr._id)}
              />
              <label htmlFor={`attr-${attr.id || attr._id}`}>{attr.name}</label>
            </div>
          ))}
        </div>
      </div>
      
      {isEnriching && (
        <div className="enrichment-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {progress < 100 ? 'Enriching...' : 'Completed!'}
            {Math.round(progress)}%
          </div>
        </div>
      )}
      
      <div className="enrichment-actions">
        <button
          className="cancel-btn"
          onClick={() => onEnrich([])}
          disabled={isEnriching}
        >
          Cancel
        </button>
        <button
          className="enrich-all-btn"
          onClick={handleEnrichAll}
          disabled={isEnriching || selectedAttributes.length === 0}
        >
          {isEnriching ? 'Processing...' : 'Enrich Selected Attributes'}
        </button>
      </div>
      
      <div className="enrichment-note">
        <p>
          <strong>Note:</strong> The AI will attempt to enrich the selected attributes 
          using product name, brand, and barcode information. Enrichment quality
          depends on the specificity of the product information.
        </p>
      </div>
    </div>
  );
}

export default EnrichmentPanel;