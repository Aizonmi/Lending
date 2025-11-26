import React, { useState, useEffect } from 'react';
import { loansAPI, studentsAPI } from '../services/api';

const BorrowedItems = () => {
  const [borrowedLoans, setBorrowedLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchBorrowedItems(true);
    } else {
      fetchAllActiveLoans(true);
    }
  }, [selectedMember]);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchAllActiveLoans = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await loansAPI.getAll({ status: 'active' });
      const activeLoans = response.data.data || [];
      
      // Also get overdue loans
      const overdueResponse = await loansAPI.getAll({ status: 'overdue' });
      const overdueLoans = overdueResponse.data.data || [];
      
      setBorrowedLoans([...activeLoans, ...overdueLoans]);
    } catch (err) {
      console.error('Error fetching borrowed items:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to load borrowed items',
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchBorrowedItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await loansAPI.getBorrowedByMember(selectedMember);
      setBorrowedLoans(response.data.data || []);
    } catch (err) {
      console.error('Error fetching borrowed items:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to load borrowed items',
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleReturn = async (loanId, itemTitle) => {
    if (!window.confirm(`Are you sure you want to return "${itemTitle}"?`)) {
      return;
    }

    setReturning(loanId);
    setMessage({ type: '', text: '' });

    try {
      await loansAPI.return(loanId);
      
      setMessage({
        type: 'success',
        text: `Book "${itemTitle}" returned successfully!`,
      });

      // Refresh borrowed items (no loading spinner)
      if (selectedMember) {
        fetchBorrowedItems(false);
      } else {
        fetchAllActiveLoans(false);
      }

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to return item',
      });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setReturning(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'returned') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading && borrowedLoans.length === 0) {
    return <div className="loading">Loading borrowed items...</div>;
  }

  return (
    <div>
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label htmlFor="memberFilter" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Filter by Student (Optional):
          </label>
          <select
            id="memberFilter"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => selectedMember ? fetchBorrowedItems(false) : fetchAllActiveLoans(false)}
          style={{ padding: '8px 16px', fontSize: '0.9rem', height: 'fit-content' }}
        >
          🔄 Refresh
        </button>
      </div>

      {borrowedLoans.length === 0 ? (
        <div className="empty-state">
          <p>No borrowed books found.</p>
          {selectedMember && (
            <p>This student has no active loans.</p>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Borrower</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowedLoans.map((loan) => {
                const overdue = isOverdue(loan.dueDate, loan.status);
                return (
                  <tr key={loan._id} style={overdue ? { backgroundColor: '#fff3cd' } : {}}>
                    <td><strong>{loan.itemId?.title || 'Unknown'}</strong></td>
                    <td>{loan.itemId?.author || '-'}</td>
                    <td>
                      {loan.borrowerMemberId?.name || 'Unknown'}
                      {loan.borrowerMemberId?.email && (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {loan.borrowerMemberId.email}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(loan.borrowDate)}</td>
                    <td style={overdue ? { color: '#e74c3c', fontWeight: '600' } : {}}>
                      {formatDate(loan.dueDate)}
                    </td>
                    <td>
                      <span className={`badge badge-${loan.status}`}>
                        {loan.status === 'active' && overdue ? 'Overdue' : loan.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReturn(loan._id, loan.itemId?.title)}
                        disabled={returning === loan._id || loan.status === 'returned'}
                      >
                        {returning === loan._id ? 'Returning...' : 'Return'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowedItems;

