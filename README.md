# Product Management System with AI Enrichment
This application is a scalable product management system designed to import customer SKU data and enrich it with AI-generated product information.

# Overview
The system allows users to:
* Import product data from CSV/Excel files
* Define custom product attributes of various types
* View and manage products with pagination, sorting, and filtering
* Enrich product data using AI to automatically fill in missing information

# Backend
Project Structure

* Controllers: Handle API routes and business logic
1. attributeController.js: Manages product attributes (CRUD operations)
2. enrichmentController.js: Handles AI enrichment of product data
3. productController.js: Manages product data operations (search, import, update)

* Models: Define data schemas
1. attributeModel.js: Schema for product attributes
2. productModel.js: Schema for product data with dynamic attributes

* Middleware: upload.js: Handles file uploads and parsing for product imports

* Services: aiService.js: Integration with OpenAI and Anthropic APIs for data enrichment

* Main Application: index.js: Express app configuration and server setup

* Getting Started
1. Set up environment variables in .env:

a. MONGODB_URI=your_mongodb_connection_string
b.  PORT=3001
c.  OPENAI_API_KEY=your_openai_api_key
d. ANTHROPIC_API_KEY=your_anthropic_api_key

2. Install dependencies: npm install
3. Start the server: npm run dev
4. Access the API at http://localhost:3001


# Frontend

* Overview

Import product data from CSV and Excel files
Manage custom product attributes
View and filter product listings
Enrich product data using AI to automatically generate descriptions, specifications, and categorizations

* Set up environment variable in .env
REACT_APP_API_URL=http://localhost:3001/api

* Start the development server
npm start

The application will be available at http://localhost:3000.

# API Services
The application communicates with the backend through the following API endpoints:

/api/attributes - CRUD operations for product attributes
/api/products - Retrieve and manage products
/api/products/import - Import products from files
/api/products/enrich - Enrich product data with AI