const { Anthropic } = require('@anthropic-ai/sdk');
const Product = require('../models/productModel');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Helper function to parse response values based on attribute type
const parseAttributeValue = (value, attributeType, options) => {
  
  try {
    switch (attributeType) {
      case 'number':
        return parseFloat(value);
      
      case 'single_select':
        // Find the closest match to the options
        if (options && options.length > 0) {
          // If exact match exists, use it
          if (options.includes(value)) {
            return value;
          }
          
          // Find the closest match using lowercase comparison
          const lowerValue = value.toLowerCase();
          const matchedOption = options.find(opt => 
            opt.toLowerCase() === lowerValue || 
            lowerValue.includes(opt.toLowerCase()) || 
            opt.toLowerCase().includes(lowerValue)
          );
          
          return matchedOption || options[0]; // Default to first option if no match
        }
        return value;
      
      case 'multi_select':
        // Handle array responses or comma-separated values
        let valueArray = Array.isArray(value) ? value : value.split(/,|;/).map(v => v.trim());
        
        // Filter and match against available options
        if (options && options.length > 0) {
          return valueArray.filter(val => {
            const lowerVal = val.toLowerCase();
            return options.some(opt => 
              opt.toLowerCase() === lowerVal || 
              lowerVal.includes(opt.toLowerCase()) || 
              opt.toLowerCase().includes(lowerVal)
            );
          });
        }
        return valueArray;
      
      case 'measure':
        // Parse measures like "100 USD" to { value: 100, unit: "USD" }
        const measureRegex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/;
        const match = value.match(measureRegex);
        
        if (match) {
          return {
            value: parseFloat(match[1]),
            unit: match[2]
          };
        }
        
        // Try to separate number and unit
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          const unit = value.replace(numericValue.toString(), '').trim();
          return {
            value: numericValue,
            unit: unit || null
          };
        }
        
        return { value, unit: null };
      
      default:
        return value;
    }
  } catch (error) {
    console.error('Error parsing attribute value:', error);
    return value; // Return original value if parsing fails
  }
};

// Generate a prompt for the AI based on the product and attributes
const generatePrompt = (product, attributes) => {
  const productInfo = {
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    images: product.images
  };

  // Format as system prompt for the AI
  let systemPrompt = `
You are an AI assistant specialized in product information enrichment.
Your task is to analyze this product and provide accurate information for the requested attributes.
Do not make up information if you're uncertain. Use "unknown" in such cases.

The product information is as follows:
- Name: ${productInfo.name}
- Brand: ${productInfo.brand || 'Unknown'}
- Barcode/UPC: ${productInfo.barcode || 'Unknown'}
- Images: ${productInfo.images.length > 0 ? 'Available (not viewable in this API)' : 'Not available'}

For each attribute, provide ONLY the value requested without additional explanation or formatting.
For measure type attributes, include both the value and unit (e.g., "10.5 USD").
For multiple select attributes, provide values separated by commas.
`;

  // Generate user prompt with required attributes
  let userPrompt = `Please provide the following information about this product:\n\n`;
  
  attributes.forEach(attr => {
    const instructions = attr.enrichment.prompt || 
                         `Provide the ${attr.name} of this product.`;
    
    userPrompt += `${attr.name} (${attr.type}): ${instructions}\n`;
    
    // Add options for select types
    if ((attr.type === 'single_select' || attr.type === 'multi_select') && attr.options && attr.options.length > 0) {
      userPrompt += `Options: ${attr.options.join(', ')}\n`;
    }
    
    // Add unit for measure type
    if (attr.type === 'measure' && attr.unit) {
      userPrompt += `Unit: ${attr.unit}\n`;
    }
    
    userPrompt += '\n';
  });
  
  userPrompt += `Format your response as a JSON object with attribute keys and values. Example: { "attribute1": "value1", "attribute2": "value2" }`;
  
  return { systemPrompt, userPrompt };
};

// Function to call OpenAI API
const callClaudeAI = async (prompt) => {
  try {
    console.log('Calling AI with prompt:', prompt);
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    return response.content[0].text; // Extract the AI response
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to get response from AI");
  }
};


// Main function to enrich a product
const enrichProduct = async (product, attributes) => {
  try {
    // Generate AI prompts
    const { systemPrompt, userPrompt } = generatePrompt(product, attributes);
    
    // Select AI model based on complexity and priority
    // For high priority attributes or complex products, use more capable models
    const useClaudeOpus = attributes.some(attr => attr.enrichment.priority > 7) || 
                          product.name.length > 100;
    
    let aiResponse;
    let retryCount = 0;
    const maxRetries = 2;
    
    // Try to get a response from AI with retries
    while (retryCount <= maxRetries) {
      try {
        aiResponse = await callClaudeAI(systemPrompt, userPrompt);
        break; // Break out of retry loop if successful
      } catch (error) {
        console.error(`AI API error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount <= maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          // Switch to alternate provider on retry
          useClaudeOpus = !useClaudeOpus;
        } else {
          // If all retries fail, try fallback
          console.log('All AI API calls failed, trying fallback enrichment');
          aiResponse = await fallbackEnrichment(product);
        }
      }
    }
    
    // Map AI response to product attributes
    const attributeMappings = {};
    attributes.forEach(attr => {
      const key = attr.key;
      
      // Check if AI returned this attribute
      if (aiResponse && aiResponse.hasOwnProperty(key)) {
        const rawValue = aiResponse[key];
        
        // Skip empty values
        if (rawValue === null || rawValue === undefined || rawValue === '' || rawValue === 'unknown') {
          return;
        }
        
        // Parse value based on attribute type
        const parsedValue = parseAttributeValue(rawValue, attr.type, attr.options);
        
        // Store in mappings
        attributeMappings[key] = parsedValue;
      }
    });
    
    // Update product with enriched attributes
    const attrKeys = Object.keys(attributeMappings);
    for (const key of attrKeys) {
      const value = attributeMappings[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // For object values like measures
        product.attributes.set(key, {
          value: value.value,
          unit: value.unit
        });
      } else {
        // For primitive values and arrays
        product.attributes.set(key, {
          value: value,
          unit: null
        });
      }
    }
    
    // Update product status and save
    product.enrichmentStatus = 'completed';
    product.lastEnriched = new Date();
    await product.save();
    
    return attributeMappings;
  } catch (error) {
    console.error('Product enrichment error:', error);
    
    // Update product status to failed
    product.enrichmentStatus = 'failed';
    await product.save();
    
    throw error;
  }
};

// Batch enrichment function for processing multiple products
const enrichProductBatch = async (productIds, attributeKeys = null) => {
  // Get products to enrich
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Get attributes to enrich
  let attributes;
  if (attributeKeys && attributeKeys.length > 0) {
    attributes = await Attribute.find({ 
      key: { $in: attributeKeys },
      'enrichment.enabled': true 
    });
  } else {
    attributes = await Attribute.find({ 'enrichment.enabled': true });
  }
  
  // Process in batches to avoid overloading the API
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(product => enrichProduct(product, attributes))
    );
    
    // Map results
    batchResults.forEach((result, index) => {
      results.push({
        productId: batch[index]._id,
        status: result.status === 'fulfilled' ? 'completed' : 'failed',
        error: result.status === 'rejected' ? result.reason.message : null
      });
    });
    
    // Throttle to avoid rate limits if batch is large
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

module.exports = {
  enrichProduct,
  enrichProductBatch,
  generatePrompt,
  parseAttributeValue
};