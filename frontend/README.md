# Product Management System (Frontend)

## Overview

This is the frontend of the Product Management System, developed using React.js. It provides a user-friendly interface to manage products, attributes, and AI-powered data enrichment.

## Features

- Product listing with sorting, filtering, and pagination
- Attribute management system
- Product enrichment using AI
- File import functionality (CSV/Excel)
- Responsive UI with a clean design

## Installation & Setup

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/)

### Setup

1. Clone the repository:
   ```sh
   git clone <repository_url>
   cd frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the frontend directory and configure environment variables:
   ```sh
   REACT_APP_API_URL=http://localhost:3000
   ```

4. Start the frontend server:
   ```sh
   npm start
   ```
   The frontend will be available at `http://localhost:3001/`.

## Frontend Structure

### Key Components
- `ProductList.js` - Displays all products with sorting and filtering
- `ProductDetail.js` - Shows detailed information about a product
- `EditProduct.js` - Enables users to edit product details
- `ImportData.js` - Handles file imports (CSV/Excel)
- `AttributeManager.js` - Manages product attributes
- `EnrichmentPanel.js` - Initiates AI-powered product enrichment
- `Header.js` - Displays the application header
- `App.js` - Main application component handling routing

### Styles
- `main.css` - Global styles
- `AttributeManager.css` - Styling for attribute management

## Technologies Used

- **Frontend:** React.js, React Router, Axios
- **State Management:** React Hooks
- **Styling:** CSS Modules, custom styles
- **API Communication:** Axios for fetching and updating data

## License
This project is licensed under the MIT License.

## Author
Developed by Nivika Malhotra.