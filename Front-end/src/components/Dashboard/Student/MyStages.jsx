import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import authAPI from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import './MyStages.css';

const MyStages = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyStages = async () => {
      try {
        setLoading(true);
        const userId = user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await authAPI.get(`/students/${userId}/internships`);
        if (response.data.success) {
          const data = response.data.data || [];
          // Filter to show only approved applications as active internships
          const activeInternships = data.filter(item => item.application_status === 'approved');
          setInternships(activeInternships);
        }
      } catch (error) {
        console.error('Failed to fetch my stages:', error);
        alert('Failed to load internships: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchMyStages();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="page"><p>Chargement...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page my-stages-page">
        <h2>Mes stages</h2>
        
        {internships.length === 0 ? (
          <p>Vous n'avez aucun stage actif pour le moment.</p>
        ) : (
          <div className="stages-list">
            {internships.map((internship) => (
              <div key={internship.id} className="stage-card">
                <div className="stage-header">
                  <h3>{internship.title || 'Stage'}</h3>
                  <span className="status-badge status-active">Actif</span>
                </div>
                
                <div className="stage-details">
                  <p><strong>Hôpital:</strong> {internship.hospital || 'N/A'}</p>
                  <p><strong>Spécialité:</strong> {internship.speciality || 'N/A'}</p>
                  {internship.startDate && (
                    <p><strong>Date de début:</strong> {new Date(internship.startDate).toLocaleDateString('fr-FR')}</p>
                  )}
                  {internship.endDate && (
                    <p><strong>Date de fin:</strong> {new Date(internship.endDate).toLocaleDateString('fr-FR')}</p>
                  )}
                  {internship.doctor_first_name && (
                    <p><strong>Encadrant:</strong> {internship.doctor_first_name} {internship.doctor_last_name}</p>
                  )}
                </div>

                <div className="stage-actions">
                  <Link to={`/internships/${internship.id}`} className="view-btn">
                    Voir les détails
                  </Link>
                  <Link to={`/evaluations?internship=${internship.id}`} className="evaluations-btn">
                    Évaluations
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

export default MyStages;
