# Backend API - Product Enrichment System

## Overview
This is a backend API built using Node.js, Express, and MongoDB. It provides functionalities for managing products, attributes, and AI-driven data enrichment.

## Features
- CRUD operations for products and attributes
- File upload support (CSV, Excel, and images)
- AI-powered product enrichment using Anthropic Claude
- Pagination, sorting, and filtering for products

## Installation & Setup

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [npm](https://www.npmjs.com/)

### MongoDB Setup
1. **Install MongoDB**:
   - Windows: Download and install MongoDB Community Edition from the [official website](https://www.mongodb.com/try/download/community).
   - macOS (using Homebrew):
     ```sh
     brew tap mongodb/brew
     brew install mongodb-community@6.0
     ```
   - Linux: Follow the [installation guide](https://docs.mongodb.com/manual/installation/) for your distribution.

2. **Start MongoDB Service**:
   ```sh
   mongod --dbpath=/your/data/directory
   ```
   (Replace `/your/data/directory` with a valid path for storing MongoDB data.)

3. **Create Database** (Optional):
   ```sh
   mongo
   use productDB
   ```

### Project Setup
1. Clone the repository:
   ```sh
   git clone <repository_url>
   cd backend-api
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and configure environment variables:
   ```sh
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/productDB
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. Start the server:
   ```sh
   npm start
   ```
   The API will be available at `http://localhost:3000/`.

## API Endpoints

### Products API
- `GET /api/products` - Get all products (supports pagination, sorting, and filtering)
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get a single product by ID
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `POST /api/products/import` - Import products via CSV/Excel

### Attributes API
- `GET /api/attributes` - Get all attributes
- `POST /api/attributes` - Create an attribute
- `PUT /api/attributes/:id` - Update an attribute
- `DELETE /api/attributes/:id` - Delete an attribute

### Enrichment API
- `POST /api/enrichment` - Start enrichment for selected products

### File Upload
- `POST /api/products/import` - Upload and process CSV/Excel files
- `POST /api/products/:id/uploadImage` - Upload product images

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose ORM
- Multer (for file uploads)
- Anthropic Claude (for AI enrichment)
- dotenv (for environment variables)

## Author
Developed by Nivika Malhotra.

