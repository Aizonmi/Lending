import React, { useState, useEffect } from 'react';
import { loansAPI, studentsAPI } from '../services/api';

const BorrowItem = () => {
  const [availableItems, setAvailableItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    borrowerMemberId: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchAvailableItems(true); // Show loading on initial load
    fetchStudents();
  }, []);

  const fetchAvailableItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await loansAPI.getAvailableItems();
      setAvailableItems(response.data.data || []);
    } catch (err) {
      console.error('Error fetching available items:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to load available items',
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleBorrow = async (itemId) => {
    if (!formData.borrowerMemberId || !formData.dueDate) {
      setMessage({
        type: 'error',
        text: 'Please select a borrower and enter a due date first',
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setBorrowing(itemId);
    setMessage({ type: '', text: '' });

    try {
      const response = await loansAPI.borrow({
        itemId,
        borrowerMemberId: formData.borrowerMemberId,
        dueDate: formData.dueDate,
      });

      setMessage({
        type: 'success',
        text: `Book "${response.data.data.itemId.title}" borrowed successfully!`,
      });

      // Refresh available items (no loading spinner)
      fetchAvailableItems(false);

      // Reset form
      setFormData({
        borrowerMemberId: '',
        dueDate: '',
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to borrow item',
      });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setBorrowing(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading && availableItems.length === 0) {
    return <div className="loading">Loading available items...</div>;
  }

  return (
    <div>
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => fetchAvailableItems(false)}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          🔄 Refresh Items
        </button>
      </div>

      {/* Borrower and Due Date Selection */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Borrower Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="borrowerMemberId">Select Student Borrower *</label>
            <select
              id="borrowerMemberId"
              name="borrowerMemberId"
              value={formData.borrowerMemberId}
              onChange={handleFormChange}
            >
              <option value="">Select a student...</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleFormChange}
              min={getMinDate()}
              required
            />
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '10px' }}>
          Select a student borrower and due date above, then click "Borrow" on any available book below.
        </p>
      </div>

      {availableItems.length === 0 ? (
        <div className="empty-state">
          <p>No available books found.</p>
          <p>All books are currently borrowed.</p>
        </div>
      ) : (
        <div className="item-grid">
          {availableItems.map((item) => (
            <div key={item._id} className="card">
              <div className="card-header">
                <div className="card-title">{item.title}</div>
                {item.author && (
                  <span style={{ 
                    color: '#666',
                    fontSize: '0.875rem'
                  }}>
                    by {item.author}
                  </span>
                )}
              </div>
              <div className="card-body">
                {item.description && <p>{item.description}</p>}
                {item.isbn && (
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                    <strong>ISBN:</strong> {item.isbn}
                  </p>
                )}
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                  Library Book
                </p>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => handleBorrow(item._id)}
                  disabled={borrowing === item._id || !formData.borrowerMemberId || !formData.dueDate}
                >
                  {borrowing === item._id ? 'Borrowing...' : 'Borrow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowItem;

