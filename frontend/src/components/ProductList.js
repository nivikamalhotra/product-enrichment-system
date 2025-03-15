import React, { useState, useEffect } from 'react';
import { fetchProducts, addProduct, deleteProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';
const host = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function ProductList({ attributes, onProductSelect }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [availableFilters] = useState(['name', 'brand', 'barcode', 'status', 'category', 'createdAt', 'enrichmentStatus']);
  const [activeFilters, setActiveFilters] = useState(['name', 'status', 'category']);
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    barcode: '',
    category: '',
    price: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const data = await fetchProducts(queryParams);
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
            return value.some(item =>
              typeof item === 'string' && item.toLowerCase().includes(filters[key].toLowerCase())
            );
          } else if (typeof value === 'object' && value !== null) {
            // For measure type with unit and value
            if (value.value !== undefined && value.unit !== undefined) {
              return value.value.toString().includes(filters[key]) ||
                value.unit.toLowerCase().includes(filters[key].toLowerCase());
            }
            // For date objects
            if (value instanceof Date) {
              const dateStr = value.toISOString().split('T')[0];
              return dateStr.includes(filters[key]);
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
        } else if (typeof valueA === 'object' && typeof valueB === 'object') {
          // For measure type
          if (valueA?.value !== undefined && valueB?.value !== undefined) {
            const numA = parseFloat(valueA.value);
            const numB = parseFloat(valueB.value);
            return sortDirection === 'asc' ? numA - numB : numB - numA;
          }
          // For dates
          if (valueA instanceof Date && valueB instanceof Date) {
            return sortDirection === 'asc'
              ? valueA.getTime() - valueB.getTime()
              : valueB.getTime() - valueA.getTime();
          }
        }
        return 0;
      });
    }

    setFilteredProducts(result);
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value
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

  const handleSelectProduct = (productId, isChecked) => {
    setSelectedProducts((prevSelected) => {
      let updatedSelection;

      if (isChecked) {
        if (!prevSelected.includes(productId)) {  // **Avoid duplicate**
          updatedSelection = [...prevSelected, productId];
        } else {
          updatedSelection = prevSelected; // **If already present, no change**
        }
      } else {
        updatedSelection = prevSelected.filter(id => id !== productId); // **Remove product**
      }

      return updatedSelection;
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(productId); // Call API
      setProducts(prevProducts => prevProducts.filter(p => p._id !== productId)); // Remove from list
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    try {
      const savedProduct = await addProduct(newProduct); // Call API to add product

      setProducts((prevProducts) => [...prevProducts, savedProduct]); // Add new product to list dynamically
      setShowAddProduct(false); // Close popup after adding
      setNewProduct({ name: '', brand: '', barcode: '', category: '', price: '' }); // Reset form
    } catch (error) {
      console.error('Failed to add product:', error);
    }
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

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const toggleFilterSelector = () => {
    setShowFilterSelector(!showFilterSelector);
  };

  const addFilter = (filter) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
    setShowFilterSelector(false);
  };

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filter];
      return newFilters;
    });
  };

  const getRemainingFilters = () => {
    return availableFilters.filter(filter => !activeFilters.includes(filter));
  };

  const handleEnrichProducts = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to enrich');
      return;
    }

    setEnriching(true);
    try {
      // Get all attribute keys that we want to enrich
      const attributeKeys = attributes.map(attr => attr.key);

      // Call the enrichment API
      const productIds = selectedProducts.map(p => p._id);
      const enrichedProducts = {} //await enrichProductsWithAI(productIds, attributeKeys);

      // Update the products state with enriched data
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          const enriched = enrichedProducts.find(p => p._id === product._id);
          return enriched || product;
        });
      });

      // Clear selection after enrichment
      setSelectedProducts([]);
      onProductSelect([]);

      alert(`Successfully enriched ${productIds.length} products`);
    } catch (error) {
      console.error('Enrichment failed:', error);
      alert(`Enrichment failed: ${error.message}`);
    } finally {
      setEnriching(false);
    }
  };

  const getFilterLabel = (filterKey) => {
    const labels = {
      name: 'Product Name',
      brand: 'Brand',
      barcode: 'Barcode',
      status: 'Status',
      category: 'Category',
      createdAt: 'Created On',
      enrichmentStatus: 'Enrichment',
      tags: 'Tags',
    };
    return labels[filterKey] || filterKey;
  };

  // Status options for dropdown
  const statusOptions = ['Active', 'Draft', 'Archived', 'Out of Stock'];
  const categoryOptions = ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Books', 'Toys'];
  const enrichmentStatusOptions = ['Pending', 'In Progress', 'Completed', 'Failed'];

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>Products ({filteredProducts.length})</h2>
        <div className="product-list-actions">
          <button
            className="action-btn primary-btn"
            onClick={() => setShowAddProduct(true)}
          >
            + Add Product
          </button>
          <button className="action-btn primary-btn" onClick={() => window.location.href = '/attributes'}>Manage Attributes</button>
          <button
            className="action-btn primary-btn"
            onClick={() => window.location.href = '/import'}
          >
            Import
          </button>
          <button
            className="action-btn"
            onClick={toggleFilters}
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          <button
            className="action-btn"
            onClick={loadProducts}
          >
            Refresh
          </button>
          <button
            className="action-btn enrich-btn"
            onClick={handleEnrichProducts}
            disabled={selectedProducts.length === 0 || enriching}
          >
            {enriching ? 'Enriching...' : 'Enrich with AI'}
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <label>Product Name</label>
              <input type="text" name="name" required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />

              <label>Brand</label>
              <input type="text" name="brand" required
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              />

              <label>Barcode</label>
              <input type="text" name="barcode" required
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
              />

              <label>Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>

              <label>Price</label>
              <input type="number" name="price" required
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />

              <div className="popup-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddProduct(false)}>Cancel</button>
                <button type="submit" className="save-btn">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="filters-container">
          <div className="filters-header">
            <h3>Filters</h3>
            <div className="filters-actions">
              <div className="filter-selector-wrapper">
                <button className="add-filter-btn" onClick={toggleFilterSelector}>
                  + Add Filter
                </button>
                {showFilterSelector && (
                  <div className="filter-selector-dropdown">
                    {getRemainingFilters().length > 0 ? (
                      getRemainingFilters().map(filter => (
                        <div
                          key={filter}
                          className="filter-option"
                          onClick={() => addFilter(filter)}
                        >
                          {getFilterLabel(filter)}
                        </div>
                      ))
                    ) : (
                      <div className="filter-option disabled">All filters added</div>
                    )}
                  </div>
                )}
              </div>
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All
              </button>
            </div>
          </div>
          <div className="active-filters">
            {activeFilters.map(filter => (
              <div key={filter} className="filter-field">
                <div className="filter-header">
                  <label>{getFilterLabel(filter)}</label>
                  <button
                    className="remove-filter-btn"
                    onClick={() => removeFilter(filter)}
                  >
                    &times;
                  </button>
                </div>
                {filter === 'status' ? (
                  <select
                    value={filters[filter] || ''}
                    onChange={(e) => handleFilterChange(filter, e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : filter === 'category' ? (
                  <select
                    value={filters[filter] || ''}
                    onChange={(e) => handleFilterChange(filter, e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                ) : filter === 'enrichmentStatus' ? (
                  <select
                    value={filters[filter] || ''}
                    onChange={(e) => handleFilterChange(filter, e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {enrichmentStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : filter === 'createdAt' ? (
                  <input
                    type="date"
                    value={filters[filter] || ''}
                    onChange={(e) => handleFilterChange(filter, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={`Filter by ${getFilterLabel(filter)}`}
                    value={filters[filter] || ''}
                    onChange={(e) => handleFilterChange(filter, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                    />
                  </th>
                  <th>Image</th>
                  <th
                    onClick={() => handleSort('name')}
                    className={sortField === 'name' ? `sort-${sortDirection}` : ''}
                  >
                    Name
                    {sortField === 'name' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort('brand')}
                    className={sortField === 'brand' ? `sort-${sortDirection}` : ''}
                  >
                    Brand
                    {sortField === 'brand' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className={sortField === 'status' ? `sort-${sortDirection}` : ''}
                  >
                    Status
                    {sortField === 'status' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className={sortField === 'category' ? `sort-${sortDirection}` : ''}
                  >
                    Category
                    {sortField === 'category' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort('price')}
                    className={sortField === 'price' ? `sort-${sortDirection}` : ''}
                  >
                    Price
                    {sortField === 'price' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort('enrichmentStatus')}
                    className={sortField === 'enrichmentStatus' ? `sort-${sortDirection}` : ''}
                  >
                    Enrichment
                    {sortField === 'enrichmentStatus' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort('barcode')}
                    className={sortField === 'barcode' ? `sort-${sortDirection}` : ''}
                  >
                    Barcode
                    {sortField === 'barcode' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  {attributes.map(attr => (
                    <th
                      key={attr.id || attr._id}
                      onClick={() => handleSort(attr.key)}
                      className={sortField === attr.key ? `sort-${sortDirection}` : ''}
                    >
                      {attr.name}
                      {sortField === attr.key && (
                        <span className="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7 + attributes.length} className="no-data">
                      No products found. Import products or adjust filters.
                    </td>
                  </tr>
                ) : (
                  currentProducts.map(product => (
                    <tr key={product._id} className={selectedProducts.some(p => p._id === product._id) ? 'selected' : ''}>
                      <td className="checkbox-column">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product)}
                          onChange={(e) => handleSelectProduct(product, e.target.checked)}
                        />
                      </td>
                      <td>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`${host}/${product.images[0]}`} // Adjust this path if needed
                            alt="Product"
                            className="product-list-image"
                          />
                        ) : (
                          <span>No Image</span> // Show a placeholder if no image exists
                        )}</td>
                      <td>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>
                        <span className={`status-badge status-${(product.status || '').toLowerCase()}`}>
                          {product.status || 'Active'}
                        </span>
                      </td>
                      <td>{product.category || 'N/A'}</td>
                      <td>{product.price || '-'}</td>
                      <td>
                        <span className={`status-badge enrichment-${(product.enrichmentStatus || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                          {product.enrichmentStatus || 'Pending'}
                        </span>
                      </td>
                      <td>{product.barcode}</td>
                      {attributes.map(attr => (
                        <td key={`${product._id}-${attr.id || attr._id}`}>
                          {renderAttributeValue(product[attr.key], attr.type)}
                        </td>
                      ))}
                      <td>
                        <button className="edit-btn" onClick={() => navigate(`/edit-product/${product._id}`)}>✏️ Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteProduct(product._id)}>🗑️ Delete</button>
                        <button className="view-btn" onClick={() => navigate(`/product/${product._id}`)}>👁 View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage > 3 ?
                  Math.min(currentPage - 3 + i + 1, totalPages) :
                  i + 1;

                return pageNum <= totalPages ? (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={currentPage === pageNum ? 'pagination-btn active' : 'pagination-btn'}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 1 && (
                <button
                  onClick={() => paginate(totalPages)}
                  className={currentPage === totalPages ? 'pagination-btn active' : 'pagination-btn'}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
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
    case 'short_text':
      return value;
    case 'long_text':
      return value.length > 50 ? `${value.substring(0, 50)}...` : value;
    case 'rich_text':
      return <div dangerouslySetInnerHTML={{ __html: value }} />;
    case 'number':
      return value.toString();
    case 'single_select':
      return value;
    case 'multiple_select':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'measure':
      return value.value !== undefined && value.unit !== undefined
        ? `${value.value} ${value.unit}`
        : value.toString();
    default:
      return typeof value === 'object' ? JSON.stringify(value) : value.toString();
  }
}

export default ProductList;