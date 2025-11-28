import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Dashboard.css';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersByRole: {}
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });

  const [newUser, setNewUser] = useState({
  email: '',
  password: '',
  role: 'student',
  first_name: '',
  last_name: '',
  specialty: '',
  phone: '',
  hospital_id: null,
  // Role-specific fields
  profile: {
    // Student fields
    student_number: '',
    department: '',
    academic_year: '',
    // Doctor fields  
    license_number: '',
    years_of_experience: '',
    medical_specialty: '',
    // Teacher fields
    subject_area: '',
    academic_rank: '',
    // Hospital Admin fields
    hospital_department: '',
    position: ''
  }
});

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
    const response = await authAPI.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await authAPI.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        usersByRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {})
      });
    }
  };

  const handleCreateUser = async (e) => {
  e.preventDefault();
  try {
    console.log('Sending user data:', newUser);
    
    // Prepare data with profile information
    const userData = {
      ...newUser,
      extra: newUser.profile // Send profile data as 'extra' field
    };
    
    const response = await authAPI.post('/admin/users', userData);
    
    if (response.data.success) {
      alert('User created successfully!');
      setShowCreateForm(false);
      // Reset form with profile fields
      setNewUser({
        email: '',
        password: '',
        role: 'student',
        first_name: '',
        last_name: '',
        specialty: '',
        phone: '',
        hospital_id: null,
        profile: {
          student_number: '',
          department: '',
          academic_year: '',
          license_number: '',
          years_of_experience: '',
          medical_specialty: '',
          subject_area: '',
          academic_rank: '',
          hospital_department: '',
          position: ''
        }
      });
      fetchUsers(); // Refresh the list
    }
  } catch (error) {
    console.error('Create user error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Error creating user';
    alert(`Error: ${errorMessage}`);
  }
};

  const handleEditUser = (user) => {
    setSelectedUser({...user});
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.put(`/auth/users/${selectedUser.id}`, selectedUser);
      if (response.data.success) {
        alert('User updated successfully!');
        setShowEditForm(false);
        setSelectedUser(null);
        fetchUsers();
        fetchDashboardStats();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await authAPI.delete(`/auth/users/${userId}`);
      if (response.data.success) {
        alert('User deleted successfully!');
        fetchUsers();
        fetchDashboardStats();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus, userEmail) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} user: ${userEmail}?`)) {
      return;
    }

    try {
      const response = await authAPI.put(`/auth/users/${userId}/status`, {
        is_active: newStatus
      });
      if (response.data.success) {
        alert(`User ${action}d successfully!`);
        fetchUsers();
        fetchDashboardStats();
      }
    } catch (error) {
      alert(error.response?.data?.message || `Error ${action}ing user`);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      super_admin: '#d32f2f',
      hospital_admin: '#f57c00',
      doctor: '#1976d2',
      teacher: '#388e3c',
      student: '#7b1fa2'
    };
    
    return (
      <span 
        className="role-badge"
        style={{ backgroundColor: roleColors[role] }}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    return (
      (filters.role ? user.role === filters.role : true) &&
      (filters.status !== '' ? user.is_active === (filters.status === 'active') : true) &&
      (filters.search ? 
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(filters.search.toLowerCase()))
        : true
      )
    );
  });

  const resetFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: ''
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Super Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.first_name || user?.email}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Active Users</h3>
            <p className="stat-number">{stats.activeUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Roles Distribution</h3>
            <div className="role-stats">
              {stats.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                <span key={role} className="role-stat">
                  {role}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <nav className="dashboard-nav">
        <div className="nav-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + Create New User
          </button>
          <button 
            onClick={fetchUsers}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="doctor">Doctor</option>
              <option value="teacher">Teacher</option>
              <option value="hospital_admin">Hospital Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button onClick={resetFilters} className="btn-clear">
            Clear Filters
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
              {/* Create User Modal */}
{showCreateForm && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h3>Create New User</h3>
        <button 
          onClick={() => setShowCreateForm(false)}
          className="close-btn"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleCreateUser}>
        <div className="form-grid">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Enter password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="First name"
              value={newUser.first_name}
              onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Last name"
              value={newUser.last_name}
              onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              required
            >
              <option value="student">Student</option>
              <option value="doctor">Doctor</option>
              <option value="teacher">Teacher</option>
              <option value="hospital_admin">Hospital Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              placeholder="Phone number"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
            />
          </div>
        </div>
        
        {/* Common fields */}
        <div className="form-group full-width">
          <label>Specialty (for doctors/teachers)</label>
          <input
            type="text"
            placeholder="Medical specialty or teaching field"
            value={newUser.specialty}
            onChange={(e) => setNewUser({...newUser, specialty: e.target.value})}
          />
        </div>

        <div className="form-group full-width">
          <label>Hospital ID (optional)</label>
          <input
            type="number"
            placeholder="Hospital ID number"
            value={newUser.hospital_id || ''}
            onChange={(e) => setNewUser({...newUser, hospital_id: e.target.value ? parseInt(e.target.value) : null})}
          />
        </div>

        {/* Role-specific fields */}
        <div className="role-specific-fields">
          {/* Student Fields */}
          {newUser.role === 'student' && (
            <div className="fields-section">
              <h4>Student Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Student Number *</label>
                  <input
                    type="text"
                    placeholder="e.g., S12345"
                    value={newUser.profile.student_number}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, student_number: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={newUser.profile.department}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, department: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <select
                    value={newUser.profile.academic_year}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, academic_year: e.target.value}
                    })}
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Fields */}
          {newUser.role === 'doctor' && (
            <div className="fields-section">
              <h4>Doctor Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medical Specialty *</label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology, Neurology"
                    value={newUser.profile.medical_specialty}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, medical_specialty: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    placeholder="Medical license number"
                    value={newUser.profile.license_number}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, license_number: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    value={newUser.profile.years_of_experience}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, years_of_experience: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Teacher Fields */}
          {newUser.role === 'teacher' && (
            <div className="fields-section">
              <h4>Teacher Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Subject Area *</label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics, Biology"
                    value={newUser.profile.subject_area}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, subject_area: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Academic Rank</label>
                  <select
                    value={newUser.profile.academic_rank}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, academic_rank: e.target.value}
                    })}
                  >
                    <option value="">Select Rank</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Instructor">Instructor</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Hospital Admin Fields */}
          {newUser.role === 'hospital_admin' && (
            <div className="fields-section">
              <h4>Hospital Admin Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    placeholder="e.g., Administration, HR, Finance"
                    value={newUser.profile.hospital_department}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, hospital_department: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    placeholder="e.g., Manager, Director, Coordinator"
                    value={newUser.profile.position}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      profile: {...newUser.profile, position: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Super Admin Fields */}
          {newUser.role === 'super_admin' && (
            <div className="fields-section">
              <h4>Super Administrator</h4>
              <p className="info-text">Full system access with all privileges.</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create User
          </button>
          <button 
            type="button" 
            onClick={() => setShowCreateForm(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


        {/* Edit User Modal */}
        {showEditForm && selectedUser && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Edit User</h3>
                <button 
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedUser(null);
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={selectedUser.first_name || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, first_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={selectedUser.last_name || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, last_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={selectedUser.phone || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="doctor">Doctor</option>
                      <option value="teacher">Teacher</option>
                      <option value="hospital_admin">Hospital Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={selectedUser.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.value === 'active'})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Specialty</label>
                  <input
                    type="text"
                    value={selectedUser.specialty || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, specialty: e.target.value})}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Update User
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedUser(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users List Section */}
        <div className="users-section">
          <div className="section-header">
            <h2>
              System Users 
              <span className="users-count">({filteredUsers.length} of {users.length})</span>
            </h2>
            {filters.search || filters.role || filters.status ? (
              <div className="active-filters">
                Active filters: 
                {filters.search && <span className="filter-tag">Search: "{filters.search}"</span>}
                {filters.role && <span className="filter-tag">Role: {filters.role}</span>}
                {filters.status && <span className="filter-tag">Status: {filters.status}</span>}
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users found matching your criteria.</p>
              {(filters.search || filters.role || filters.status) && (
                <button onClick={resetFilters} className="btn-primary">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map(user => (
                <div key={user.id} className={`user-card ${!user.is_active ? 'inactive' : ''}`}>
                  <div className="user-header">
                    <div className="user-title">
                      <h4>
                        {user.first_name && user.last_name ? 
                          `${user.first_name} ${user.last_name}` : 
                          'No Name Provided'
                        }
                        {user.id === 1 && <span className="super-admin-badge">👑 Main Admin</span>}
                      </h4>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="user-actions">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="edit-btn"
                        title="Edit User"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id, user.is_active, user.email)}
                        className={`status-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                      {user.id !== 1 && (
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="delete-btn"
                          title="Delete User"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="user-details">
                    <p className="user-email">📧 {user.email}</p>
                    {user.phone && <p className="user-phone">📞 {user.phone}</p>}
                    {user.specialty && <p className="user-specialty">🎯 {user.specialty}</p>}
                    {user.hospital_id && <p className="user-hospital">🏥 Hospital ID: {user.hospital_id}</p>}
                  </div>
                  
                  <div className="user-footer">
                    <span className={`user-status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                    <span className="user-created">
                      📅 {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;