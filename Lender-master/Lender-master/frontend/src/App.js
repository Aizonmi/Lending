import React, { useState, useEffect } from 'react';
import './App.css';

// Library Components
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import BookForm from './components/BookForm';
import BookList from './components/BookList';

// Member B Components
import BorrowItem from './components/BorrowItem';
import BorrowedItems from './components/BorrowedItems';

// Member C Components
import DashboardOverview from './components/DashboardOverview';
import CurrentBorrows from './components/CurrentBorrows';
import StatsCharts from './components/StatsCharts';
import LoanHistory from './components/LoanHistory';

import { dashboardAPI } from './services/api';

function App() {
  const [activeSystem, setActiveSystem] = useState('catalog'); // catalog, lending, dashboard
  const [activeTab, setActiveTab] = useState('members'); // For catalog: members/items
  const [notifications, setNotifications] = useState([]);
  const [hasOverdue, setHasOverdue] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await dashboardAPI.getNotifications();
      setNotifications(response.data.data || []);
      setHasOverdue(response.data.hasOverdue || false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>📚 Library Lending System</h1>
          <p>Book Lending Management Platform</p>
        </div>

        {/* Global Overdue Alert */}
        {hasOverdue && notifications.length > 0 && (
          <div className="alert alert-danger">
            <strong>⚠️ Overdue Books Alert!</strong>
            <span>{notifications.length} book(s) are overdue.</span>
          </div>
        )}

        {/* Main System Navigation */}
        <div className="tabs" style={{ borderBottom: '3px solid #667eea', paddingBottom: '5px' }}>
          <button
            className={`tab ${activeSystem === 'catalog' ? 'active' : ''}`}
            onClick={() => {
              setActiveSystem('catalog');
              setActiveTab('members');
            }}
          >
            📚 Books & Students
          </button>
          <button
            className={`tab ${activeSystem === 'lending' ? 'active' : ''}`}
            onClick={() => {
              setActiveSystem('lending');
              setActiveTab('borrow');
            }}
          >
            🔄 Lending & Returns
          </button>
          <button
            className={`tab ${activeSystem === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveSystem('dashboard');
              setActiveTab('overview');
            }}
          >
            📊 Dashboard & Reports
          </button>
        </div>

        {/* Member A - Catalog & Member Profiles */}
        {activeSystem === 'catalog' && (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                Students
              </button>
              <button
                className={`tab ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                Books
              </button>
            </div>

            {activeTab === 'members' && (
              <>
                <div className="section">
                  <h2>Add New Student</h2>
                  <StudentForm onStudentAdded={() => setRefreshTrigger(prev => prev + 1)} />
                </div>
                <div className="section">
                  <h2>All Students</h2>
                  <StudentList refreshTrigger={refreshTrigger} />
                </div>
              </>
            )}

            {activeTab === 'items' && (
              <>
                <div className="section">
                  <h2>Add New Book</h2>
                  <BookForm onBookAdded={() => setRefreshTrigger(prev => prev + 1)} />
                </div>
                <div className="section">
                  <h2>All Books</h2>
                  <BookList refreshTrigger={refreshTrigger} />
                </div>
              </>
            )}
          </>
        )}

        {/* Member B - Lending & Return Logic */}
        {activeSystem === 'lending' && (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'borrow' ? 'active' : ''}`}
                onClick={() => setActiveTab('borrow')}
              >
                Borrow Book
              </button>
              <button
                className={`tab ${activeTab === 'return' ? 'active' : ''}`}
                onClick={() => setActiveTab('return')}
              >
                Return Book
              </button>
            </div>

            {activeTab === 'borrow' && (
              <div className="section">
                <h2>Available Books for Borrowing</h2>
                <BorrowItem />
              </div>
            )}

            {activeTab === 'return' && (
              <div className="section">
                <h2>Currently Borrowed Books</h2>
                <BorrowedItems />
              </div>
            )}
          </>
        )}

        {/* Member C - Dashboard & Reporting */}
        {activeSystem === 'dashboard' && (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview & Stats
              </button>
              <button
                className={`tab ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                Current Borrows
              </button>
              <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Loan History
              </button>
              <button
                className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
                onClick={() => setActiveTab('charts')}
              >
                Analytics & Charts
              </button>
            </div>

            {activeTab === 'overview' && (
              <DashboardOverview notifications={notifications} />
            )}

            {activeTab === 'current' && (
              <CurrentBorrows />
            )}

            {activeTab === 'history' && (
              <LoanHistory />
            )}

            {activeTab === 'charts' && (
              <StatsCharts />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

