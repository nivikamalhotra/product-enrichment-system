const API_URL = `${process.env.REACT_APP_API_URL}/api/products` || 'http://localhost:3001/api/products';
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api` || 'http://localhost:3001/api';


export const fetchProducts = async (queryParams = '') => {
  const response = await fetch(`${API_URL}?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const fetchProductById = async (productId) => {
  const response = await fetch(`${API_URL}/${productId}`);
  if (!response.ok) throw new Error("Failed to fetch product");
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
export const enrichProductsWithAI = async (selectedProducts) => {
  try {
    try {
      const response = await fetch(`${API_BASE_URL}/enrichment`, {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProducts),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating attribute:', error);
      throw error;
    }

    // // // const product = await Promise.all(products.map(async (product) => {
    // // //   const propertyPrompts = properties.map(prop => `Fill the ${prop.name} (${prop.type}) for this product.`).join("\n");
    // // //   const response = await fetch('https://api.openai.com/v1/chat/completions', {
    // // //     method: "POST",
    // // //     headers: {
    // // //       "Authorization": `Bearer ${process.env.REACT_APP_OPEN_AI_API_KEY}`,
    // // //       "Content-Type": "application/json",
    // // //     },
    // // //     body: JSON.stringify({
    // // //       model: "gpt-4",
    // // //       messages: [{ role: "user", createAttribute }],
    // // //     }),
    // // //   });

    // // //   const aiResponse = await response.json();
    // // //   return { ...product, enrichedData: aiResponse.choices[0].message.content };
    // // }));

    // return await product.json();
  } catch (error) {
    console.error('Enrichment error:', error);
    throw error;
  }
};
