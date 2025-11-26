import React, { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';

const BookList = ({ refreshTrigger }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    available: '',
  });
  const [deleting, setDeleting] = useState(null);

  const fetchBooks = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const params = {};
      if (filter.available !== '') {
        params.available = filter.available;
      }
      const response = await booksAPI.getAll(params);
      setBooks(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(true); // Show loading on initial load or filter change
  }, [filter, refreshTrigger]);

  const handleDelete = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?\n\nThis action cannot be undone. You cannot delete a book that is currently borrowed.`)) {
      return;
    }

    setDeleting(bookId);
    try {
      const response = await booksAPI.delete(bookId);
      setBooks(books.filter(b => b._id !== bookId));
      alert('Book deleted successfully!');
      // Refresh the list
      fetchBooks(false);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete book';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  if (loading && books.length === 0) {
    return <div className="loading">Loading books...</div>;
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
              <option value="">All Books</option>
              <option value="true">Available Only</option>
              <option value="false">Borrowed Only</option>
            </select>
          </div>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => fetchBooks(false)}
          style={{ padding: '8px 16px', fontSize: '0.9rem', height: 'fit-content' }}
        >
          🔄 Refresh
        </button>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found.</p>
          <p>Add a new book using the form above.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Availability</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author || '-'}</td>
                  <td>{book.isbn || '-'}</td>
                  <td>
                    <span className={`badge badge-${book.available ? 'available' : 'unavailable'}`}>
                      {book.available ? 'Available' : 'Borrowed'}
                    </span>
                  </td>
                  <td>{book.description || '-'}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(book._id, book.title)}
                      disabled={deleting === book._id || !book.available}
                      style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                      title={!book.available ? 'Cannot delete borrowed book' : 'Delete book'}
                    >
                      {deleting === book._id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
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

export default BookList;

