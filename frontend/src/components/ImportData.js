import React, { useState, useRef } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import { importProducts } from '../services/api';

function ImportData({ onImport }) {
  const navigate = useNavigate();
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

      if (!Array.isArray(importedProducts)) {
        console.error("Error: API did not return an array:", importedProducts);
        setError("Unexpected response format from the server.");
        return;
      }
      
      setSuccess(`Successfully imported ${importedProducts.length} products.`);
      onImport(importedProducts)      
      setFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // ✅ Redirect to product listing page after import
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import products.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSampleCSV = () => {
    const sampleCSV = `Name,Brand,Barcode,Image
  Wireless Mouse,Logitech,123456789012,http://example.com/images/mouse.jpg
  Gaming Keyboard,Razer,987654321098,http://example.com/images/keyboard.jpg
  Bluetooth Speaker,JBL,567890123456,http://example.com/images/speaker.jpg
  Smartwatch,Apple,345678901234,http://example.com/images/smartwatch.jpg
  USB Flash Drive,SanDisk,678901234567,http://example.com/images/usb.jpg`;

    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="import-container">
      <div className="import-header">
        <h2>Import Products</h2>
        <Link to="/" className="import-back-btn">← Back to Products</Link>
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

      <button onClick={handleDownloadSampleCSV} className="download-btn">
        Download Sample CSV
      </button>
    </div>
  );
}

export default ImportData;