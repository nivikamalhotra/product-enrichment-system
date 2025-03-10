import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import AttributeManager from './components/AttributeManager';
import ImportData from './components/ImportData';
import EnrichmentPanel from './components/EnrichmentPanel';
import { fetchAttributes } from './services/api';
import './styles/main.css';

function App() {
  const [attributes, setAttributes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const data = await fetchAttributes();
        setAttributes(data);
      } catch (error) {
        console.error('Error loading attributes:', error);
      }
    };
    
    loadAttributes();
  }, []);

  const handleProductImport = (importedProducts) => {
    setProducts((prevProducts) => [...prevProducts, ...importedProducts]);
  };

  const handleProductSelect = (products) => {
    setSelectedProducts(products);
  };

  const handleAttributeUpdate = (updatedAttributes) => {
    setAttributes(updatedAttributes);
  };

  const handleProductEnrichment = (enrichedProducts) => {
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const enriched = enrichedProducts.find(p => p.id === product.id);
        return enriched || product;
      });
    });
    setSelectedProducts([]);
  };

  return (
    <div className="app">
      <Header />
      <main className="content">
        <section className="data-management">
          <AttributeManager 
            attributes={attributes} 
            onAttributeUpdate={handleAttributeUpdate} 
          />
          <ImportData onImport={handleProductImport} />
        </section>
        <section className="product-section">
          <ProductList 
            products={products}
            attributes={attributes}
            onProductSelect={handleProductSelect}
          />
          <EnrichmentPanel 
            selectedProducts={selectedProducts}
            attributes={attributes}
            onEnrichment={handleProductEnrichment}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
