import React, { useState } from 'react';
import ManageOffers from './Hospital/ManageOffers';
import ReceivedApplications from './Hospital/ReceivedApplications';
import Services from './Hospital/Services';
import Mentors from './Hospital/Mentors';
import Reports from './Hospital/Reports';
import Messages from './Hospital/Messages';
import Hospitals from './Hospital/Hospitals';
import { useAuth } from '../../context/AuthContext';

const HospitalDashboard = () => {
  const [active, setActive] = useState('dashboard');
  const { logout } = useAuth();

  const renderContent = () => {
    switch (active) {
      case 'dashboard':
        return <Hospitals />;
      case 'offers':
        return <ManageOffers />;
      case 'applications':
        return <ReceivedApplications />;
      case 'services':
        return <Services />;
      case 'mentors':
        return <Mentors />;
      case 'reports':
        return <Reports />;
      case 'messages':
        return <Messages />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h1>Hospital Admin Dashboard</h1>
      <div style={{ marginTop: 12 }}>{renderContent()}</div>
    </div>
  );
};

export default HospitalDashboard;