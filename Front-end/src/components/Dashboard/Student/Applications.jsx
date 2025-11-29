import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import authAPI from '../../../services/api';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await authAPI.get('/students/applications');
        if (response.data.success) {
          setApplications(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        alert('Failed to load applications: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page"><p>Chargement...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page applications-page">
        <h2>Mes candidatures</h2>
        
        {applications.length === 0 ? (
          <p>Aucune candidature pour le moment.</p>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-header">
                  <h3>{application.internship_title || 'Stage'}</h3>
                  <span 
                    className={`status-badge status-${getStatusColor(application.status)}`}
                  >
                    {getStatusText(application.status)}
                  </span>
                </div>
                
                <div className="application-details">
                  <p><strong>Hôpital:</strong> {application.hospital_name || 'N/A'}</p>
                  <p><strong>Date de candidature:</strong> {new Date(application.created_at).toLocaleDateString('fr-FR')}</p>
                  {application.cover_letter && (
                    <div className="cover-letter">
                      <strong>Lettre de motivation:</strong>
                      <p>{application.cover_letter}</p>
                    </div>
                  )}
                </div>

                <div className="application-actions">
                  <Link to={`/internships/${application.internship_id}`} className="view-btn">
                    Voir les détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Applications;
