import React, { useState } from 'react';
import { importProducts } from '../services/api';

function ImportData({ onImport }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
  };

  const validateFile = (file) => {
    if (!file) return false;
    
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
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import products.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="import-data">
      <h2>Import Products</h2>
      <div className="upload-container">
        <input
          type="file"
          id="file-upload"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="file-upload" className="file-label">
          Choose CSV or Excel File
        </label>
        <div className="file-info">
          {file ? (
            <span>{file.name}</span>
          ) : (
            <span>No file selected</span>
          )}
        </div>
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
        <h3>Import Instructions</h3>
        <p>The file should contain the following columns:</p>
        <ul>
          <li>name - Product name (required)</li>
          <li>brand - Product brand (required)</li>
          <li>barcode - Product barcode (required)</li>
          <li>imageUrl - Product image URL (optional)</li>
        </ul>
        <p>CSV columns should be separated by commas. Excel files should have these columns in the first sheet.</p>
      </div>
    </div>
  );
}

export default ImportData;