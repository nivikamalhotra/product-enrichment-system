import React, { useState, useEffect } from 'react';
import { fetchAttributes, createAttribute, updateAttribute, deleteAttribute } from '../services/api';

function AttributeManager() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    type: 'short_text',
    options: [],
    description: ''
  });
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [tempOption, setTempOption] = useState('');

  const attributeTypes = [
    { value: 'short_text', label: 'Short Text (< 50 chars)' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'rich_text', label: 'Rich Text (HTML)' },
    { value: 'number', label: 'Number' },
    { value: 'single_select', label: 'Single Select' },
    { value: 'multiple_select', label: 'Multiple Select' },
    { value: 'measure', label: 'Measure (value with unit)' }
  ];

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const data = await fetchAttributes();
      setAttributes(data);
    } catch (error) {
      console.error('Error loading attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (editingAttribute) {
      setEditingAttribute({
        ...editingAttribute,
        [name]: value
      });
    } else {
      setNewAttribute({
        ...newAttribute,
        [name]: value
      });
    }
  };

  const handleAddOption = () => {
    if (!tempOption.trim()) return;
    
    if (editingAttribute) {
      setEditingAttribute({
        ...editingAttribute,
        options: [...(editingAttribute.options || []), tempOption]
      });
    } else {
      setNewAttribute({
        ...newAttribute,
        options: [...(newAttribute.options || []), tempOption]
      });
    }
    
    setTempOption('');
  };

  const handleRemoveOption = (index) => {
    if (editingAttribute) {
      const newOptions = [...editingAttribute.options];
      newOptions.splice(index, 1);
      setEditingAttribute({
        ...editingAttribute,
        options: newOptions
      });
    } else {
      const newOptions = [...newAttribute.options];
      newOptions.splice(index, 1);
      setNewAttribute({
        ...newAttribute,
        options: newOptions
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAttribute) {
        await updateAttribute(editingAttribute._id, editingAttribute);
      } else {
        await createAttribute(newAttribute);
      }
      
      await loadAttributes();
      resetForm();
    } catch (error) {
      console.error('Error saving attribute:', error);
    }
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        await deleteAttribute(id);
        await loadAttributes();
      } catch (error) {
        console.error('Error deleting attribute:', error);
      }
    }
  };

  const resetForm = () => {
    setNewAttribute({
      name: '',
      type: 'short_text',
      options: [],
      description: ''
    });
    setEditingAttribute(null);
    setShowForm(false);
    setTempOption('');
  };

  if (loading && attributes.length === 0) {
    return <div className="flex justify-center my-8"><div className="loader"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Attributes</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Attribute
        </button>
      </div>

      {/* Attributes List */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Options</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attributes.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No attributes defined yet. Create your first attribute.
                </td>
              </tr>
            ) : (
              attributes.map(attr => (
                <tr key={attr._id}>
                  <td className="p-3 border">{attr.name}</td>
                  <td className="p-3 border">
                    {attributeTypes.find(t => t.value === attr.type)?.label || attr.type}
                  </td>
                  <td className="p-3 border">{attr.description}</td>
                  <td className="p-3 border">
                    {['single_select', 'multiple_select'].includes(attr.type) && attr.options ? (
                      <ul className="list-disc pl-4">
                        {attr.options.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td className="p-3 border">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(attr)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(attr._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editingAttribute ? editingAttribute.name : newAttribute.name} 
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Type</label>
                <select 
                  name="type" 
                  value={editingAttribute ? editingAttribute.type : newAttribute.type} 
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  {attributeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={editingAttribute ? editingAttribute.description : newAttribute.description} 
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
              
              {(editingAttribute?.type === 'single_select' || editingAttribute?.type === 'multiple_select' || 
                newAttribute.type === 'single_select' || newAttribute.type === 'multiple_select') && (
                <div className="mb-4">
                  <label className="block mb-1">Options</label>
                  <div className="flex mb-2">
                    <input 
                      type="text" 
                      value={tempOption} 
                      onChange={(e) => setTempOption(e.target.value)}
                      className="flex-1 p-2 border rounded-l"
                      placeholder="Add option..."
                    />
                    <button 
                      type="button"
                      onClick={handleAddOption}
                      className="px-4 py-2 bg-blue-500 text-white rounded-r"
                    >
                      Add
                    </button>
                  </div>
                  
                  <ul className="list-disc pl-4">
                    {(editingAttribute?.options || newAttribute.options).map((option, idx) => (
                      <li key={idx} className="flex justify-between items-center">
                        {option}
                        <button 
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingAttribute ? 'Update' : 'Create'} Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttributeManager;