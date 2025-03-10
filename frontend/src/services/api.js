const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Import products from file
export const importProducts = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/import`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing products:', error);
    throw error;
  }
};

// Enrich products with AI
export const enrichProducts = async (productIds, attributeKeys) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds, attributeKeys }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enriching products:', error);
    throw error;
  }
};
