import React from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import DoctorDashboard from '../components/Dashboard/DoctorDashboard';
import HospitalDashboard from '../components/Dashboard/HospitalDashboard';
import TeacherDashboard from '../components/Dashboard/TeacherDashboard';
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return <div>Loading...</div>;

    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'hospital_admin':
        return <HospitalDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'admin':
      case 'super_admin':
        return <SuperAdminDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <Layout>
      {getDashboard()}
    </Layout>
  );
};

export default DashboardPage;