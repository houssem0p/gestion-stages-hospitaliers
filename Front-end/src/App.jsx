import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import HospitalDashboard from './components/Dashboard/HospitalDashboard';
import './App.css';

// Placeholder for TeacherDashboard (since it's missing)
const TeacherDashboard = () => <div style={{ padding: '20px' }}><h1>Teacher Dashboard</h1><p>Teacher dashboard content goes here</p></div>;

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Dashboard router
const DashboardRouter = () => {
  const { user } = useAuth();

  console.log('Current user:', user); // Debug log

  switch (user?.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'hospital_admin':
      return <HospitalDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return (
        <div style={{ padding: '20px' }}>
          <h2>Access Denied</h2>
          <p>No dashboard available for your role: {user?.role}</p>
        </div>
      );
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;