import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
//import './Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API calls
    setInternships([
      {
        id: 1,
        title: 'Medical Internship at Central Hospital',
        hospital: 'Central Hospital',
        startDate: '2025-01-15',
        endDate: '2025-06-15',
        status: 'active',
        supervisor: 'Dr. Smith'
      },
      {
        id: 2,
        title: 'Surgery Rotation',
        hospital: 'City Medical Center',
        startDate: '2024-09-01',
        endDate: '2024-12-01',
        status: 'completed',
        supervisor: 'Dr. Johnson'
      }
    ]);

    setApplications([
      {
        id: 1,
        position: 'Pediatrics Intern',
        hospital: 'Children Hospital',
        appliedDate: '2025-01-10',
        status: 'pending'
      },
      {
        id: 2,
        position: 'Emergency Medicine Intern',
        hospital: 'General Hospital',
        appliedDate: '2025-01-08',
        status: 'accepted'
      }
    ]);

    setAvailableOffers([
      {
        id: 1,
        title: 'Cardiology Internship',
        hospital: 'Heart Institute',
        duration: '6 months',
        applicationDeadline: '2025-02-01',
        requirements: '3rd year medical student'
      },
      {
        id: 2,
        title: 'Neurology Rotation',
        hospital: 'Neuro Center',
        duration: '4 months',
        applicationDeadline: '2025-02-15',
        requirements: '4th year medical student'
      }
    ]);
  }, []);

  const handleApply = (offerId) => {
    // Handle application logic
    alert(`Applied for offer #${offerId}`);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      completed: 'info',
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger'
    };
    
    return (
      <span className={`status-badge ${statusColors[status] || 'secondary'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Student Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.first_name} {user?.last_name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{internships.length}</div>
            <div className="stat-label">Total Internships</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {applications.filter(app => app.status === 'accepted').length}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{availableOffers.length}</div>
            <div className="stat-label">Available Offers</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            My Internships
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            Find Internships
          </button>
          <button 
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Current Internship</h3>
                  {internships.find(i => i.status === 'active') ? (
                    <div className="current-internship">
                      <h4>{internships.find(i => i.status === 'active').title}</h4>
                      <p>Hospital: {internships.find(i => i.status === 'active').hospital}</p>
                      <p>Supervisor: {internships.find(i => i.status === 'active').supervisor}</p>
                      <p>Duration: {internships.find(i => i.status === 'active').startDate} to {internships.find(i => i.status === 'active').endDate}</p>
                    </div>
                  ) : (
                    <p>No active internship</p>
                  )}
                </div>

                <div className="overview-card">
                  <h3>Recent Applications</h3>
                  {applications.slice(0, 3).map(application => (
                    <div key={application.id} className="application-item">
                      <div className="app-info">
                        <strong>{application.position}</strong>
                        <span>{application.hospital}</span>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  ))}
                </div>

                <div className="overview-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button className="action-btn primary">Upload Documents</button>
                    <button className="action-btn secondary">Find Internships</button>
                    <button className="action-btn secondary">View Schedule</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Internships Tab */}
          {activeTab === 'internships' && (
            <div className="internships-tab">
              <h2>My Internships</h2>
              <div className="internships-list">
                {internships.map(internship => (
                  <div key={internship.id} className="internship-card">
                    <div className="internship-header">
                      <h3>{internship.title}</h3>
                      {getStatusBadge(internship.status)}
                    </div>
                    <div className="internship-details">
                      <p><strong>Hospital:</strong> {internship.hospital}</p>
                      <p><strong>Supervisor:</strong> {internship.supervisor}</p>
                      <p><strong>Duration:</strong> {internship.startDate} to {internship.endDate}</p>
                    </div>
                    <div className="internship-actions">
                      <button className="btn-outline">View Details</button>
                      {internship.status === 'active' && (
                        <button className="btn-primary">Submit Report</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="applications-tab">
              <h2>My Applications</h2>
              <div className="applications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Hospital</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(application => (
                      <tr key={application.id}>
                        <td>{application.position}</td>
                        <td>{application.hospital}</td>
                        <td>{application.appliedDate}</td>
                        <td>{getStatusBadge(application.status)}</td>
                        <td>
                          <button className="btn-sm">View</button>
                          {application.status === 'pending' && (
                            <button className="btn-sm danger">Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Find Internships Tab */}
          {activeTab === 'offers' && (
            <div className="offers-tab">
              <h2>Available Internship Offers</h2>
              <div className="search-filters">
                <input 
                  type="text" 
                  placeholder="Search internships..." 
                  className="search-input"
                />
                <select className="filter-select">
                  <option value="">All Specialties</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="surgery">Surgery</option>
                  <option value="pediatrics">Pediatrics</option>
                </select>
              </div>
              <div className="offers-grid">
                {availableOffers.map(offer => (
                  <div key={offer.id} className="offer-card">
                    <div className="offer-header">
                      <h3>{offer.title}</h3>
                      <span className="hospital-badge">{offer.hospital}</span>
                    </div>
                    <div className="offer-details">
                      <p><strong>Duration:</strong> {offer.duration}</p>
                      <p><strong>Deadline:</strong> {offer.applicationDeadline}</p>
                      <p><strong>Requirements:</strong> {offer.requirements}</p>
                    </div>
                    <div className="offer-actions">
                      <button className="btn-outline">View Details</button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleApply(offer.id)}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="documents-tab">
              <h2>My Documents</h2>
              <div className="documents-upload">
                <h3>Upload Documents</h3>
                <div className="upload-area">
                  <p>Drag & drop files here or click to browse</p>
                  <input type="file" multiple />
                </div>
              </div>
              <div className="documents-list">
                <h3>Uploaded Documents</h3>
                <div className="document-items">
                  <div className="document-item">
                    <span>CV.pdf</span>
                    <button className="btn-sm">Download</button>
                  </div>
                  <div className="document-item">
                    <span>Transcripts.pdf</span>
                    <button className="btn-sm">Download</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;