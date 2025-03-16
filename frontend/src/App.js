import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductList from './components/ProductList';
import AttributeManager from './components/AttributeManager';
import ImportData from './components/ImportData';
import EditProduct from "./components/EditProduct";
import ProductDetail from "./components/ProductDetail";
import { fetchAttributes, enrichProductsWithAI } from './services/api';
import './styles/main.css';

function App() {
  const [attributes, setAttributes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
 
  useEffect(() => {
    const loadAttributes = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAttributes();
        setAttributes(data);
      } catch (error) {
        console.error('Error loading attributes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttributes();
  }, []);

  const handleProductImport = (importedProducts) => {
    setProducts((prevProducts) => {
      const existingBarcodes = new Set(prevProducts.map(p => p.barcode));
      const newProducts = importedProducts.filter(p => !existingBarcodes.has(p.barcode));
      return [...prevProducts, ...newProducts];
    });
  };

  const handleProductSelect = (products) => {
    setSelectedProducts(products);
  };

  const handleAttributeUpdate = (updatedAttributes) => {
    setAttributes(updatedAttributes);
  };

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={
              <>
                <section className="product-section">
                  <ProductList
                    products={products}
                    attributes={attributes}
                    onProductSelect={handleProductSelect}
                  />
                </section>
              </>
            } />

            <Route path="/import" element={
              <ImportData onImport={handleProductImport} fullPage={true} />
            } />

            <Route path="/attributes" element={
              <AttributeManager
                attributes={attributes}
                onUpdate={handleAttributeUpdate}
                onShowModal={() => setShowAttributeModal(true)}
              />
            } />

            <Route path="/edit-product/:id" element={<EditProduct />} />

            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
