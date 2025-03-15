const API_URL = 'http://localhost:3001/api/products';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';


export const fetchProducts = async (queryParams = '') => {
  const response = await fetch(`${API_URL}?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const importProducts = async (formData) => {
  const response = await fetch(`${API_URL}/import`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Failed to import products');
  return response.json();
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

export const addProduct = async (productData) => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error('Failed to add product');
  }

  return await response.json();
};



// Fetch all attributes
export const fetchAttributes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/attributes`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching attributes:', error);
    throw error;
  }
};

// Create a new attribute
export const createAttribute = async (attributeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attributes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributeData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating attribute:', error);
    throw error;
  }
};

// Update an existing attribute
export const updateAttribute = async (attributeId, attributeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attributes/${attributeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributeData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating attribute:', error);
    throw error;
  }
};

// Delete an attribute
export const deleteAttribute = async (attributeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attributes/${attributeId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting attribute:', error);
    throw error;
  }
};



// Enrich products with AI
export const enrichProductsWithAI = async (products) => {
  const response = await fetch('/api/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  });

  if (!response.ok) {
    throw new Error('Failed to enrich products');
  }

  return await response.json();
};