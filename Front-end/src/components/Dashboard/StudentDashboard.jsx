import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './scss.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [profile, setProfile] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

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
        supervisor: 'Dr. Smith',
        supervisorEmail: 'dr.smith@hospital.com',
        department: 'Cardiology',
        progress: 65
      },
      {
        id: 2,
        title: 'Surgery Rotation',
        hospital: 'City Medical Center',
        startDate: '2024-09-01',
        endDate: '2024-12-01',
        status: 'completed',
        supervisor: 'Dr. Johnson',
        supervisorEmail: 'dr.johnson@medicalcenter.com',
        department: 'Surgery',
        progress: 100
      }
    ]);

    setApplications([
      {
        id: 1,
        position: 'Pediatrics Intern',
        hospital: 'Children Hospital',
        appliedDate: '2025-01-10',
        status: 'pending',
        department: 'Pediatrics'
      },
      {
        id: 2,
        position: 'Emergency Medicine Intern',
        hospital: 'General Hospital',
        appliedDate: '2025-01-08',
        status: 'accepted',
        department: 'Emergency Medicine'
      },
      {
        id: 3,
        position: 'Neurology Intern',
        hospital: 'Neuro Center',
        appliedDate: '2025-01-05',
        status: 'rejected',
        department: 'Neurology'
      }
    ]);

    setAvailableOffers([
      {
        id: 1,
        title: 'Cardiology Internship',
        hospital: 'Heart Institute',
        duration: '6 months',
        applicationDeadline: '2025-02-01',
        requirements: '3rd year medical student',
        department: 'Cardiology',
        location: 'New York',
        stipend: '$1,500/month',
        spots: 3
      },
      {
        id: 2,
        title: 'Neurology Rotation',
        hospital: 'Neuro Center',
        duration: '4 months',
        applicationDeadline: '2025-02-15',
        requirements: '4th year medical student',
        department: 'Neurology',
        location: 'Boston',
        stipend: '$1,800/month',
        spots: 2
      }
    ]);

    setDocuments([
      { id: 1, name: 'CV.pdf', type: 'CV', uploadDate: '2025-01-01', size: '2.4 MB' },
      { id: 2, name: 'Transcripts.pdf', type: 'Academic', uploadDate: '2025-01-01', size: '1.8 MB' },
      { id: 3, name: 'Medical_License.pdf', type: 'Certification', uploadDate: '2025-01-02', size: '3.1 MB' }
    ]);

    setMessages([
      { id: 1, from: 'Dr. Smith', subject: 'Weekly Schedule Update', date: '2025-01-15', read: false },
      { id: 2, from: 'Internship Coordinator', subject: 'Document Verification', date: '2025-01-14', read: true }
    ]);

    setEvaluations([
      { id: 1, internship: 'Surgery Rotation', evaluator: 'Dr. Johnson', date: '2024-12-01', rating: 4.5, comments: 'Excellent performance' },
      { id: 2, internship: 'Cardiology Internship', evaluator: 'Dr. Smith', date: '2025-01-10', rating: 4.2, comments: 'Good progress' }
    ]);

    setProfile({
      firstName: user?.first_name || 'John',
      lastName: user?.last_name || 'Doe',
      email: user?.email || 'john.doe@student.edu',
      phone: '+1 234 567 8900',
      studentId: 'MED2024001',
      year: '3rd Year',
      specialization: 'General Medicine',
      profileCompletion: 75
    });
  }, [user]);

  const handleApply = (offerId) => {
    // Handle application logic
    alert(`Applied for offer #${offerId}`);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    // Handle file upload logic
    alert(`Uploaded ${files.length} file(s)`);
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

  const filteredOffers = availableOffers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Student Dashboard</h1>
            <div className="user-info">
              <div className="user-avatar">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
              <div className="user-details">
                <span className="welcome-text">Welcome back,</span>
                <span className="user-name">{profile.firstName} {profile.lastName}</span>
              </div>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          </div>
          
          {/* Profile Completion */}
          <div className="profile-completion">
            <div className="completion-header">
              <span>Profile Completion</span>
              <span>{profile.profileCompletion}%</span>
            </div>
            <div className="completion-bar">
              <div 
                className="completion-progress" 
                style={{ width: `${profile.profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-number">{internships.length}</div>
            <div className="stat-label">Total Internships</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">
              {applications.filter(app => app.status === 'accepted').length}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📬</div>
            <div className="stat-number">{messages.filter(m => !m.read).length}</div>
            <div className="stat-label">Unread Messages</div>
          </div>
        </div>

        {/* Navigation is handled by the top navbar now. In-page quick links removed. */}

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
                      <div className="internship-meta">
                        <span>🏥 {internships.find(i => i.status === 'active').hospital}</span>
                        <span>👨‍⚕️ {internships.find(i => i.status === 'active').supervisor}</span>
                      </div>
                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span>{internships.find(i => i.status === 'active').progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${internships.find(i => i.status === 'active').progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-internship">
                      <p>No active internship</p>
                      <button className="btn-primary" onClick={() => setActiveTab('offers')}>
                        Find Internships
                      </button>
                    </div>
                  )}
                </div>

                <div className="overview-card">
                  <h3>Recent Applications</h3>
                  <div className="applications-list">
                    {applications.slice(0, 3).map(application => (
                      <div key={application.id} className="application-item">
                        <div className="app-info">
                          <strong>{application.position}</strong>
                          <span>{application.hospital}</span>
                          <small>{application.appliedDate}</small>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button 
                      className="action-btn primary" 
                      onClick={() => setActiveTab('documents')}
                    >
                      📁 Upload Documents
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => setActiveTab('offers')}
                    >
                      🔍 Find Internships
                    </button>
                    <button className="action-btn secondary">
                      📅 View Schedule
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => setActiveTab('messages')}
                    >
                      💬 Check Messages
                    </button>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Recent Evaluations</h3>
                  <div className="evaluations-list">
                    {evaluations.slice(0, 2).map(evalItem => (
                      <div key={evalItem.id} className="evaluation-item">
                        <div className="eval-header">
                          <strong>{evalItem.internship}</strong>
                          <span className="rating">⭐ {evalItem.rating}/5</span>
                        </div>
                        <p className="eval-comments">{evalItem.comments}</p>
                        <small>By {evalItem.evaluator} on {evalItem.date}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Internships Tab */}
          {activeTab === 'internships' && (
            <div className="internships-tab">
              <div className="tab-header">
                <h2>My Internships</h2>
                <button className="btn-primary">+ New Internship</button>
              </div>
              <div className="internships-list">
                {internships.map(internship => (
                  <div key={internship.id} className="internship-card">
                    <div className="internship-header">
                      <div className="internship-title">
                        <h3>{internship.title}</h3>
                        <span className="department">{internship.department}</span>
                      </div>
                      {getStatusBadge(internship.status)}
                    </div>
                    <div className="internship-details">
                      <div className="detail-item">
                        <span className="detail-label">🏥 Hospital</span>
                        <span>{internship.hospital}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">👨‍⚕️ Supervisor</span>
                        <span>{internship.supervisor}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📅 Duration</span>
                        <span>{internship.startDate} to {internship.endDate}</span>
                      </div>
                      {internship.status === 'active' && (
                        <div className="progress-section">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span>{internship.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${internship.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="internship-actions">
                      <button className="btn-outline">View Details</button>
                      <button className="btn-outline">Contact Supervisor</button>
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
              <div className="tab-header">
                <h2>My Applications</h2>
                <div className="application-stats">
                  <span className="stat">Total: {applications.length}</span>
                  <span className="stat accepted">Accepted: {applications.filter(a => a.status === 'accepted').length}</span>
                  <span className="stat pending">Pending: {applications.filter(a => a.status === 'pending').length}</span>
                </div>
              </div>
              <div className="applications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Hospital</th>
                      <th>Department</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(application => (
                      <tr key={application.id}>
                        <td>
                          <div className="position-cell">
                            <strong>{application.position}</strong>
                          </div>
                        </td>
                        <td>{application.hospital}</td>
                        <td>
                          <span className="department-tag">{application.department}</span>
                        </td>
                        <td>{application.appliedDate}</td>
                        <td>{getStatusBadge(application.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-sm outline">View</button>
                            {application.status === 'pending' && (
                              <button className="btn-sm danger">Withdraw</button>
                            )}
                          </div>
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
              <div className="tab-header">
                <h2>Available Internship Offers</h2>
                <div className="search-filters">
                  <div className="search-box">
                    <input 
                      type="text" 
                      placeholder="Search internships, hospitals, departments..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  <select className="filter-select">
                    <option value="">All Departments</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="surgery">Surgery</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="neurology">Neurology</option>
                  </select>
                </div>
              </div>
              
              <div className="offers-grid">
                {filteredOffers.map(offer => (
                  <div key={offer.id} className="offer-card">
                    <div className="offer-header">
                      <div className="offer-title">
                        <h3>{offer.title}</h3>
                        <span className="hospital-badge">{offer.hospital}</span>
                      </div>
                      <span className="spots-badge">{offer.spots} spots left</span>
                    </div>
                    
                    <div className="offer-details">
                      <div className="detail-row">
                        <span className="detail-label">📍 Location</span>
                        <span>{offer.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">⏱️ Duration</span>
                        <span>{offer.duration}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">💰 Stipend</span>
                        <span>{offer.stipend}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📅 Deadline</span>
                        <span className="deadline">{offer.applicationDeadline}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🎓 Requirements</span>
                        <span>{offer.requirements}</span>
                      </div>
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
              <div className="tab-header">
                <h2>My Documents</h2>
                <button className="btn-primary">Upload New</button>
              </div>
              
              <div className="documents-upload">
                <div className="upload-area">
                  <div className="upload-icon">📁</div>
                  <p>Drag & drop files here or click to browse</p>
                  <small>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)</small>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              
              <div className="documents-list">
                <h3>Uploaded Documents</h3>
                <div className="document-items">
                  {documents.map(doc => (
                    <div key={doc.id} className="document-item">
                      <div className="document-info">
                        <div className="document-icon">📄</div>
                        <div className="document-details">
                          <span className="document-name">{doc.name}</span>
                          <div className="document-meta">
                            <span className="document-type">{doc.type}</span>
                            <span className="document-size">{doc.size}</span>
                            <span className="document-date">{doc.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="document-actions">
                        <button className="btn-sm outline">Download</button>
                        <button className="btn-sm danger">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="messages-tab">
              <div className="tab-header">
                <h2>Messages</h2>
                <button className="btn-primary">+ New Message</button>
              </div>
              
              <div className="messages-container">
                <div className="messages-list">
                  {messages.map(message => (
                    <div key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`}>
                      <div className="message-avatar">
                        {message.from.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <strong>{message.from}</strong>
                          <span className="message-date">{message.date}</span>
                        </div>
                        <p className="message-subject">{message.subject}</p>
                      </div>
                      {!message.read && <div className="unread-indicator"></div>}
                    </div>
                  ))}
                </div>
                
                <div className="message-compose">
                  <h3>Compose Message</h3>
                  <div className="compose-form">
                    <select className="form-input">
                      <option value="">Select Supervisor</option>
                      {internships.map(i => (
                        <option key={i.id} value={i.supervisorEmail}>
                          {i.supervisor} - {i.hospital}
                        </option>
                      ))}
                    </select>
                    <input type="text" placeholder="Subject" className="form-input" />
                    <textarea placeholder="Type your message here..." className="form-input" rows="6"></textarea>
                    <button className="btn-primary">Send Message</button>
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