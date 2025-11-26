import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/api';

const COLORS = ['#9b59b6', '#3498db', '#e74c3c', '#f39c12', '#1abc9c'];

const StatsCharts = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading charts...</div>;
  }

  if (!stats) {
    return <div className="empty-state">No statistics available for charts</div>;
  }

  // Prepare data for most borrowed books chart
  const mostBorrowedData = stats.mostBorrowedItems.map(item => ({
    name: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
    fullName: item.title,
    borrows: item.borrowCount,
  }));

  // Prepare data for borrow counts by student chart
  const memberBorrowsData = stats.borrowCountsByMember.map(member => ({
    name: member.name.length > 15 ? member.name.substring(0, 15) + '...' : member.name,
    fullName: member.name,
    borrows: member.borrowCount,
  }));

  return (
    <div>
      {/* Most Borrowed Books Chart */}
      <div className="chart-container">
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Top 5 Most Borrowed Books</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mostBorrowedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, 'Borrows']}
              labelFormatter={(label) => {
                const item = mostBorrowedData.find(d => d.name === label);
                return item ? item.fullName : label;
              }}
            />
            <Legend />
            <Bar dataKey="borrows" fill="#9b59b6" name="Total Borrows" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Borrow Counts by Student Chart */}
      <div className="chart-container">
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Top 5 Students by Borrow Count</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={memberBorrowsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, 'Borrows']}
              labelFormatter={(label) => {
                const member = memberBorrowsData.find(d => d.name === label);
                return member ? member.fullName : label;
              }}
            />
            <Legend />
            <Bar dataKey="borrows" fill="#3498db" name="Total Borrows" />
          </BarChart>
        </ResponsiveContainer>
      </div>


      {/* Summary Statistics */}
      <div className="section">
        <h2>Summary Statistics</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Students</td>
                <td><strong>{stats.overall.totalMembers}</strong></td>
              </tr>
              <tr>
                <td>Total Books</td>
                <td><strong>{stats.overall.totalItems}</strong></td>
              </tr>
              <tr>
                <td>Available Books</td>
                <td><strong>{stats.overall.availableItems}</strong></td>
              </tr>
              <tr>
                <td>Borrowed Books</td>
                <td><strong>{stats.overall.borrowedItems}</strong></td>
              </tr>
              <tr>
                <td>Total Loans</td>
                <td><strong>{stats.overall.totalLoans}</strong></td>
              </tr>
              <tr>
                <td>Active Loans</td>
                <td><strong>{stats.overall.activeLoans}</strong></td>
              </tr>
              <tr>
                <td>Returned Loans</td>
                <td><strong>{stats.overall.returnedLoans}</strong></td>
              </tr>
              <tr>
                <td>Overdue Loans</td>
                <td style={{ color: '#e74c3c', fontWeight: '600' }}>
                  <strong>{stats.overall.overdueLoans}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;

