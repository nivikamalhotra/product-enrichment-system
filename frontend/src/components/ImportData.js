import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { importProducts } from '../services/api';

function ImportData({ onImport }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
  };

  const validateFile = (file) => {
    if (!file) {
      setError('Please select a file to import.');
      return false;
    }
    
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      setError(`Invalid file type. Please upload a CSV or Excel file.`);
      return false;
    }
    
    return true;
  };

  const handleImport = async () => {
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const importedProducts = await importProducts(formData);
      
      setSuccess(`Successfully imported ${importedProducts.length} products.`);
      onImport(importedProducts);
      setFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import products.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="import-container">
      <div className="import-header">
        <h2>Import Products</h2>
        <Link to="/" className="back-button">← Back to Products</Link>
      </div>
      
      <div className="upload-box">
        <input
          type="file"
          id="file-upload"
          ref={fileInputRef}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="file-upload" className="file-label">
          {file ? file.name : 'Choose a CSV or Excel File'}
        </label>
        <button 
          onClick={handleImport} 
          disabled={!file || isUploading}
          className="import-button"
        >
          {isUploading ? 'Importing...' : 'Import Products'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="import-instructions">
        <h3>Instructions</h3>
        <p>Ensure your file follows the correct format:</p>
        <ul>
          <li><strong>Name</strong> - Product name (required)</li>
          <li><strong>Brand</strong> - Product brand (required)</li>
          <li><strong>Barcode</strong> - Unique product barcode (required)</li>
          <li><strong>Image URL</strong> - Link to product image (optional)</li>
        </ul>
      </div>
    </div>
  );
}

export default ImportData;