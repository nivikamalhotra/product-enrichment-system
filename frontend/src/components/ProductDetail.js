import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const host = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ProductDetail = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${host}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="loading">Loading product details...</div>;
  }

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate("/")}>← Back to Product List</button>

      <div className="product-card">
        <div className="product-image-section">
          {product.images && product.images.length > 0 ? (
            <img src={`${host}/${product.images[0]}`} alt={product.name} className="product-image" />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>

        <div className="product-info-section">
          <h2>{product.name}</h2>
          <p><strong>Brand:</strong> {product.brand || "N/A"}</p>
          <p><strong>Barcode:</strong> {product.barcode || "N/A"}</p>
          <p><strong>Category:</strong> {product.category || "N/A"}</p>
          <p><strong>Price:</strong> ${product.price || "N/A"}</p>
          <p><strong>Status:</strong> <span className={`status-badge ${product.status.toLowerCase()}`}>{product.status}</span></p>
          <p><strong>Enrichment Status:</strong> {product.enrichmentStatus || "Pending"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
