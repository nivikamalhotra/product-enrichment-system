import React, { useState } from 'react';
import '../styles/AttributeManager.css';

function AttributeManager({ attributes, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newAttribute, setNewAttribute] = useState({ name: '', type: 'short_text' });

  // Open Add/Edit Modal
  const openModal = (index = null) => {
    if (index !== null) {
      setNewAttribute(attributes[index]);
      setEditIndex(index);
    } else {
      setNewAttribute({ name: '', type: 'short_text' });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  // Save or Update Attribute
  const handleSaveAttribute = () => {
    if (newAttribute.name.trim() === '') return;

    let updatedAttributes = [...attributes];
    if (editIndex !== null) {
      updatedAttributes[editIndex] = newAttribute; // Update existing attribute
    } else {
      updatedAttributes.push(newAttribute); // Add new attribute
    }

    onUpdate(updatedAttributes);
    setShowModal(false);
    setNewAttribute({ name: '', type: 'short_text' });
    setEditIndex(null);
  };

  // Delete Attribute
  const handleDeleteAttribute = (index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this attribute?');
    if (confirmDelete) {
      const updatedAttributes = attributes.filter((_, i) => i !== index);
      onUpdate(updatedAttributes);
    }
  };

  return (
    <div className="attribute-manager">
      {/* Header Buttons */}
      <div className="header-buttons">
        <button className="back-btn" onClick={() => window.location.href = '/'}>← Back to Product List</button>
        <button className="add-btn" onClick={() => openModal()}>+ Add Attribute</button>
      </div>

      {/* Attributes Table */}
      <table className="attribute-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attributes.length > 0 ? (
            attributes.map((attr, index) => (
              <tr key={index}>
                <td>{attr.name}</td>
                <td>{attr.type.replace('_', ' ')}</td>
                <td>
                  <button className="edit-btn" onClick={() => openModal(index)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteAttribute(index)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="no-data">No attributes found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">{editIndex !== null ? 'Edit Attribute' : 'Add Attribute'}</h3>

            <div className="input-group">
              <label>Name:</label>
              <input
                type="text"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Type:</label>
              <select
                value={newAttribute.type}
                onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
              >
                <option value="short_text">Short Text</option>
                <option value="long_text">Long Text</option>
                <option value="rich_text">Rich Text (HTML)</option>
                <option value="number">Number</option>
                <option value="single_select">Single Select</option>
                <option value="multiple_select">Multiple Select</option>
                <option value="measure">Measure (Unit + Value)</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSaveAttribute}>
                {editIndex !== null ? 'Update' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttributeManager;
