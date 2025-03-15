import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/api";
import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/products` || 'http://localhost:3001/api/products';
const host = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await fetchProductById(id);
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };
        loadProduct();
    }, [id]);

    const handleInputChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleAttributeChange = (key, value) => {
        setProduct({
            ...product,
            attributes: { ...product.attributes, [key]: value },
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0]; // Get the first selected file

        if (file) {
            setProduct({
                ...product,
                imageFile: file, // Store new file for upload
                previewImage: URL.createObjectURL(file) // Temporary preview
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("brand", product.brand);
        formData.append("barcode", product.barcode);
        formData.append("status", product.status);
        formData.append("category", product.category);
        formData.append("price", product.price);
        formData.append("enrichmentStatus", product.enrichmentStatus);

        // Check if a new image is selected
        if (product.imageFile) {
            formData.append("image", product.imageFile); // Append file to FormData
        }

        try {
            await axios.put(
                `${API_URL}/${product._id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            alert("Product updated successfully!");
            navigate("/");
        } catch (error) {
            console.error("Failed to update product:", error);
        }
    };

    if (!product) return <p>Loading...</p>;

    return (
        <div className="edit-product-container">
            <h2>Edit Product</h2>
            <button type="button" className="edit-back-btn" onClick={() => navigate("/")}>Back to Product List</button>

            <form onSubmit={handleSubmit}>
                <table className="edit-product-table">
                    <tbody>
                        <tr>
                            <td><label>Product Name</label></td>
                            <td><input type="text" name="name" value={product.name} onChange={handleInputChange} required /></td>
                        </tr>
                        <tr>
                            <td><label>Brand</label></td>
                            <td><input type="text" name="brand" value={product.brand} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>Barcode</label></td>
                            <td><input type="text" name="barcode" value={product.barcode} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>Status</label></td>
                            <td>
                                <select name="status" value={product.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Archived">Archived</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><label>Enrichment</label></td>
                            <td>
                                <select name="enrichmentStatus" value={product.enrichmentStatus} onChange={handleInputChange}>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><label>Category</label></td>
                            <td>
                                <select name="category" value={product.category} onChange={handleInputChange}>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Food">Food</option>
                                    <option value="Home & Garden">Home & Garden</option>
                                    <option value="Books">Books</option>
                                    <option value="Toys">Toys</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><label>Price</label></td>
                            <td><input type="number" name="price" value={product.price} onChange={handleInputChange} /></td>
                        </tr>

                        {/* Attributes */}
                        <tr>
                            <td><label>Attributes</label></td>
                        </tr>
                        {Object.keys(product.attributes).map((key) => (
                            <tr key={key}>
                                <td><label>{key}</label></td>
                                <td><input type="text" value={product.attributes[key]} onChange={(e) => handleAttributeChange(key, e.target.value)} /></td>
                            </tr>
                        ))}

                        {/* Image Upload */}
                        <tr>
                            <td><label>Upload Image</label></td>
                            <td>
                                <input type="file" accept="image/*" onChange={handleImageUpload} />

                                <div className="image-preview">
                                    {/* Show newly selected image preview */}
                                    {product.previewImage && (
                                        <img src={product.previewImage} alt="New Preview" />
                                    )}

                                    {/* Show existing product images from database */}
                                    {!product.previewImage && product.images && product.images.length > 0 && (
                                        product.images.map((img, index) => (
                                            <img key={index} src={`${host}/${img}`} alt="Product Image" />
                                        ))
                                    )}
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td colSpan="2">
                                <button type="submit" className="save-btn">Update Product</button>
                                <button type="button" className="cancel-btn" onClick={() => navigate("/")}>Cancel</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
};

export default EditProduct;
