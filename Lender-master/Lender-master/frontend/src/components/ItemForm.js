import React, { useState, useEffect } from 'react';
import { itemsAPI, membersAPI } from '../services/api';

const ItemForm = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'book',
    owner: '',
    description: '',
  });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const itemTypes = [
    { value: 'book', label: 'Book' },
    { value: 'tool', label: 'Tool' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await membersAPI.getAll();
        setMembers(response.data.data || []);
      } catch (err) {
        console.error('Error fetching members:', err);
        setMessage({
          type: 'error',
          text: 'Failed to load members. Please refresh the page.',
        });
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.owner) {
      newErrors.owner = 'Owner is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await itemsAPI.create(formData);
      
      setMessage({
        type: 'success',
        text: 'Item added successfully!',
      });
      
      // Reset form
      setFormData({
        title: '',
        type: 'book',
        owner: '',
        description: '',
      });

      // Notify parent component if callback provided
      if (onItemAdded) {
        onItemAdded(response.data.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to add item';
      const errorDetails = error.response?.data?.error?.details;
      
      setMessage({
        type: 'error',
        text: errorDetails 
          ? `${errorMessage}: ${errorDetails.map(d => d.msg).join(', ')}`
          : errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter item title"
          />
          {errors.title && <div className="error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            {itemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="owner">Owner *</label>
          {loadingMembers ? (
            <div>Loading members...</div>
          ) : (
            <select
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
            >
              <option value="">Select owner</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          )}
          {errors.owner && <div className="error">{errors.owner}</div>}
          {members.length === 0 && !loadingMembers && (
            <div className="error">
              No members available. Please add a member first.
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter item description (optional)"
        />
      </div>

      <div className="btn-group">
        <button type="submit" className="btn btn-primary" disabled={loading || members.length === 0}>
          {loading ? 'Adding...' : 'Add Item'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFormData({
              title: '',
              type: 'book',
              owner: '',
              description: '',
            });
            setErrors({});
            setMessage({ type: '', text: '' });
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default ItemForm;

