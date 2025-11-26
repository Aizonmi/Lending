import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';

const StudentList = ({ refreshTrigger }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchStudents = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await studentsAPI.getAll();
      setStudents(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(true); // Show loading on initial load
  }, [refreshTrigger]);

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete "${studentName}"?\n\nNote: You cannot delete a student who has active loans.`)) {
      return;
    }

    setDeleting(studentId);
    try {
      const response = await studentsAPI.delete(studentId);
      setStudents(students.filter(s => s._id !== studentId));
      alert('Student deleted successfully!');
      // Refresh the list
      fetchStudents(false);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete student';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading && students.length === 0) {
    return <div className="loading">Loading students...</div>;
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
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>Students List</h3>
        <button 
          className="btn btn-secondary" 
          onClick={() => fetchStudents(false)}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          🔄 Refresh
        </button>
      </div>
      {students.length === 0 ? (
        <div className="empty-state">
          <p>No students found.</p>
          <p>Add a new student using the form above.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Student ID</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td><strong>{student.name}</strong></td>
                  <td>{student.email}</td>
                  <td>{student.studentId || '-'}</td>
                  <td>{student.phone || '-'}</td>
                  <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(student._id, student.name)}
                      disabled={deleting === student._id}
                      style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                    >
                      {deleting === student._id ? 'Deleting...' : '🗑️ Delete'}
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

export default StudentList;

