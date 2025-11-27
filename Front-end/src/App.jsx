import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Dashboard routes
import StudentProfile from './components/Dashboard/Student/Profile';
import StudentOffers from './components/Dashboard/Student/Offers';
import StudentApplications from './components/Dashboard/Student/Applications';
import StudentMyStages from './components/Dashboard/Student/MyStages';
import StudentEvaluations from './components/Dashboard/Student/Evaluations';
import StudentMessages from './components/Dashboard/Student/Messages';
import StudentSavedInternships from './components/Dashboard/Student/SavedInternships';
import StudentInternshipDetail from './components/Dashboard/Student/InternshipDetail';

import DoctorMyTrainees from './components/Dashboard/Doctor/MyTrainees';
import DoctorEvaluations from './components/Dashboard/Doctor/DoctorEvaluations';
import DoctorMessages from './components/Dashboard/Doctor/Messages';

import HospitalManageOffers from './components/Dashboard/Hospital/ManageOffers';
import HospitalReceivedApplications from './components/Dashboard/Hospital/ReceivedApplications';
import HospitalServices from './components/Dashboard/Hospital/Services';
import HospitalMentors from './components/Dashboard/Hospital/Mentors';
import HospitalReports from './components/Dashboard/Hospital/Reports';
import HospitalMessages from './components/Dashboard/Hospital/Messages';

import TeacherMyStudents from './components/Dashboard/Teacher/MyStudents';
import TeacherAttestations from './components/Dashboard/Teacher/Attestations';
import TeacherAvailability from './components/Dashboard/Teacher/Availability';
import TeacherEvaluations from './components/Dashboard/Teacher/Evaluations';
import TeacherMessages from './components/Dashboard/Teacher/Messages';

import AdminUsers from './components/Dashboard/Admin/Users';
import AdminStats from './components/Dashboard/Admin/Stats';

import EvaluationsWrapper from './components/Dashboard/Shared/EvaluationsWrapper';
import MessagesWrapper from './components/Dashboard/Shared/MessagesWrapper';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Student-specific routes (protected) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internships"
              element={
                <ProtectedRoute>
                  <StudentOffers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <StudentApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-stages"
              element={
                <ProtectedRoute>
                  <StudentMyStages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations"
              element={
                <ProtectedRoute>
                  <StudentEvaluations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <StudentMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-internships"
              element={
                <ProtectedRoute>
                  <StudentSavedInternships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internships/:id"
              element={
                <ProtectedRoute>
                  <StudentInternshipDetail />
                </ProtectedRoute>
              }
            />

            {/* Doctor-specific routes (protected) */}
            <Route
              path="/my-trainees"
              element={
                <ProtectedRoute>
                  <DoctorMyTrainees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/evaluations"
              element={
                <ProtectedRoute>
                  <DoctorEvaluations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/messages"
              element={
                <ProtectedRoute>
                  <DoctorMessages />
                </ProtectedRoute>
              }
            />

            {/* Hospital-specific routes (protected) */}
            <Route
              path="/manage-offers"
              element={
                <ProtectedRoute>
                  <HospitalManageOffers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/received-applications"
              element={
                <ProtectedRoute>
                  <HospitalReceivedApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <HospitalServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors"
              element={
                <ProtectedRoute>
                  <HospitalMentors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/reports"
              element={
                <ProtectedRoute>
                  <HospitalReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/messages"
              element={
                <ProtectedRoute>
                  <HospitalMessages />
                </ProtectedRoute>
              }
            />

            {/* Teacher-specific routes (protected) */}
            <Route
              path="/my-students"
              element={
                <ProtectedRoute>
                  <TeacherMyStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/evaluations"
              element={
                <ProtectedRoute>
                  <TeacherEvaluations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attestations"
              element={
                <ProtectedRoute>
                  <TeacherAttestations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/messages"
              element={
                <ProtectedRoute>
                  <TeacherMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability"
              element={
                <ProtectedRoute>
                  <TeacherAvailability />
                </ProtectedRoute>
              }
            />

            {/* Admin-specific routes (protected) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute>
                  <AdminStats />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;