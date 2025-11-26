import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    available: '',
    type: '',
  });

  const fetchItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const params = {};
      if (filter.available !== '') {
        params.available = filter.available;
      }
      if (filter.type) {
        params.type = filter.type;
      }
      const response = await itemsAPI.getAll(params);
      setItems(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(true); // Show loading only on initial load or filter change
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  if (error) {
    return (
      <div className="message message-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '200px' }}>
          <label htmlFor="filter-available" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Filter by Availability:
          </label>
          <select
            id="filter-available"
            name="available"
            value={filter.available}
            onChange={handleFilterChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Items</option>
            <option value="true">Available Only</option>
            <option value="false">Borrowed Only</option>
          </select>
        </div>
        <div style={{ minWidth: '200px' }}>
          <label htmlFor="filter-type" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Filter by Type:
          </label>
          <select
            id="filter-type"
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Types</option>
            <option value="book">Book</option>
            <option value="tool">Tool</option>
            <option value="equipment">Equipment</option>
            <option value="electronic">Electronic</option>
            <option value="other">Other</option>
            </select>
        </div>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => fetchItems(false)}
          style={{ padding: '8px 16px', fontSize: '0.9rem', height: 'fit-content' }}
        >
          🔄 Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No items found.</p>
          <p>Add a new item using the form above.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Availability</th>
                <th>Description</th>
                <th>Item ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.title}</strong></td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                  </td>
                  <td>
                    {item.owner ? (
                      <div>
                        <div>{item.owner.name}</div>
                        <small style={{ color: '#666' }}>{item.owner.email}</small>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${item.available ? 'available' : 'unavailable'}`}>
                      {item.available ? 'Available' : 'Borrowed'}
                    </span>
                  </td>
                  <td>{item.description || '-'}</td>
                  <td>
                    <code style={{ fontSize: '0.85rem' }}>{item._id}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ItemList;

