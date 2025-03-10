import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';

function ProductList({ products: propProducts, attributes, onProductSelect }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts);
      setFilteredProducts(propProducts);
    } else {
      loadProducts();
    }
  }, [propProducts]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();      
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortField, sortDirection, products]);

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(product => {
          const value = product[key];
          if (value === null || value === undefined) return false;
          
          // Handle different attribute types
          if (typeof value === 'string') {
            return value.toLowerCase().includes(filters[key].toLowerCase());
          } else if (typeof value === 'number') {
            return value.toString().includes(filters[key]);
          } else if (Array.isArray(value)) {
            return value.some(item => item.toLowerCase().includes(filters[key].toLowerCase()));
          } else if (typeof value === 'object' && value !== null) {
            // For measure type with unit and value
            if (value.value !== undefined && value.unit !== undefined) {
              return value.value.toString().includes(filters[key]) || 
                    value.unit.toLowerCase().includes(filters[key].toLowerCase());
            }
          }
          return false;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let valueA = a[sortField] || '';
        let valueB = b[sortField] || '';
        
        // Handle different types
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        } else if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        } else if (typeof valueA === 'object' && typeof valueB === 'object' && 
                  valueA.value !== undefined && valueB.value !== undefined) {
          // For measure type
          const numA = parseFloat(valueA.value);
          const numB = parseFloat(valueB.value);
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }
        return 0;
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters/sorting change
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageProducts = getCurrentPageProducts();
      setSelectedProducts(currentPageProducts);
      onProductSelect(currentPageProducts);
    } else {
      setSelectedProducts([]);
      onProductSelect([]);
    }
  };

  const handleSelectProduct = (product, isSelected) => {
    let updatedSelection;
    if (isSelected) {
      updatedSelection = [...selectedProducts, product];
    } else {
      updatedSelection = selectedProducts.filter(p => p.id !== product.id);
    }
    setSelectedProducts(updatedSelection);
    onProductSelect(updatedSelection);
  };

  // Pagination calculations
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const getCurrentPageProducts = () => {
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };
  const currentProducts = getCurrentPageProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="product-list">
      <h2>Product List</h2>
      
      {/* Filters */}
      <div className="filters">
        {attributes.map(attr => (
          <div key={attr.id} className="filter-field">
            <label>{attr.name}</label>
            <input
              type="text"
              placeholder={`Filter by ${attr.name}`}
              onChange={(e) => handleFilterChange(attr.key, e.target.value)}
              value={filters[attr.key] || ''}
            />
          </div>
        ))}
      </div>
      
      {/* Table */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <table className="product-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                  />
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className={sortField === 'name' ? `sort-${sortDirection}` : ''}
                >
                  Name
                </th>
                <th 
                  onClick={() => handleSort('brand')}
                  className={sortField === 'brand' ? `sort-${sortDirection}` : ''}
                >
                  Brand
                </th>
                <th 
                  onClick={() => handleSort('barcode')}
                  className={sortField === 'barcode' ? `sort-${sortDirection}` : ''}
                >
                  Barcode
                </th>
                {attributes.map(attr => (
                  <th 
                    key={attr.id}
                    onClick={() => handleSort(attr.key)}
                    className={sortField === attr.key ? `sort-${sortDirection}` : ''}
                  >
                    {attr.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={4 + attributes.length} className="no-data">
                    No products found.
                  </td>
                </tr>
              ) : (
                currentProducts.map(product => (
                  <tr key={product.id} className={selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.some(p => p.id === product.id)}
                        onChange={(e) => handleSelectProduct(product, e.target.checked)}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.barcode}</td>
                    {attributes.map(attr => (
                      <td key={`${product.id}-${attr.id}`}>
                        {renderAttributeValue(product[attr.key], attr.type)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={currentPage === i + 1 ? 'active' : ''}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
          
          <div className="selection-info">
            {selectedProducts.length > 0 ? (
              <p>{selectedProducts.length} products selected</p>
            ) : (
              <p>No products selected</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to render attribute values based on their type
function renderAttributeValue(value, type) {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'shortText':
    case 'longText':
      return value;
    case 'richText':
      return <div dangerouslySetInnerHTML={{ __html: value }} />;
    case 'number':
      return value.toString();
    case 'singleSelect':
      return value;
    case 'multipleSelect':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'measure':
      return `${value.value} ${value.unit}`;
    default:
      return JSON.stringify(value);
  }
}

export default ProductList;
