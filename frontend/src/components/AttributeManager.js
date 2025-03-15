import React, { useState, useEffect } from 'react';
import '../styles/AttributeManager.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const host = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const AttributeManager = () => {
  const navigate = useNavigate();
  const [attributes, setAttributes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    key: "",
    description: "",
    type: "short_text",
    required: false,
    options: [],
    unit: "",
    enrichment: { enabled: true, priority: 5, prompt: "" },
    display: { showInList: true, order: 0 },
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await axios.get(`${host}/api/attributes`);
      setAttributes(response.data);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAttribute) {
        await axios.put(`${host}/api/attributes/${editingAttribute._id}`, newAttribute);
      } else {
        await axios.post(`${host}/api/attributes`, newAttribute);
      }
      setShowModal(false);
      setEditingAttribute(null);
      fetchAttributes();
      setNewAttribute({
        name: "",
        description: "",
        type: "short_text",
        required: false,
        unit: "",
        display: { showInList: true, order: 0 }
      })
    } catch (error) {
      console.error("Error saving attribute:", error);
    }
  };

  // Handle Edit Attribute
  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setNewAttribute(attribute);
    setShowModal(true);
  };

  // Handle Delete Attribute
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attribute?")) return;
    try {
      await axios.delete(`${host}/api/attributes/${id}`);
      fetchAttributes();
    } catch (error) {
      console.error("Error deleting attribute:", error);
    }
  };

  return (
    <div className="attribute-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/")}>←</button>

      <h2>Manage Attributes</h2>

      <button onClick={() => setShowModal(true)} className="add-btn">+ Add Attribute</button>

      {/* Attribute Table */}
      <table className="attribute-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Type</th>
            <th>Required</th>
            <th>Show in List</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attributes.length > 0 ? (
            attributes.map((attr) => (
              <tr key={attr._id}>
                <td>{attr.name}</td>
                <td>{attr.key}</td>
                <td>{attr.type.replace("_", " ")}</td>
                <td>{attr.required ? "Yes" : "No"}</td>
                <td>{attr.display.showInList ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleEdit(attr)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(attr._id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7">No attributes found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>{editingAttribute ? "Edit Attribute" : "Add Attribute"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Name:</label>
              <input type="text" value={newAttribute.name} onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })} required />

              <label>Description:</label>
              <textarea value={newAttribute.description} onChange={(e) => setNewAttribute({ ...newAttribute, description: e.target.value })}></textarea>

              <label>Type:</label>
              <select value={newAttribute.type} onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}>
                <option value="short_text">Short Text</option>
                <option value="long_text">Long Text</option>
                <option value="rich_text">Rich Text</option>
                <option value="number">Number</option>
                <option value="single_select">Single Select</option>
                <option value="multi_select">Multi Select</option>
                <option value="measure">Measure (Value + Unit)</option>
                required
              </select>

              <label>Required:</label>
              <input type="checkbox" checked={newAttribute.required} onChange={(e) => setNewAttribute({ ...newAttribute, required: e.target.checked })} />

              <label>Show in List:</label>
              <input type="checkbox" checked={newAttribute.display.showInList} onChange={(e) => setNewAttribute({ ...newAttribute, display: { ...newAttribute.display, showInList: e.target.checked } })} />

              <div className="popup-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributeManager;
