import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import authAPI from '../../../services/api';
import './MyTrainees.css';

const MyTrainees = () => {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setLoading(true);
        const response = await authAPI.get('/doctors/trainees');
        if (response.data.success) {
          setTrainees(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch trainees:', error);
        alert('Failed to load trainees: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="page"><p>Chargement...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page my-trainees-page">
        <h2>Mes stagiaires</h2>
        
        {trainees.length === 0 ? (
          <p>Aucun stagiaire assigné pour le moment.</p>
        ) : (
          <div className="trainees-list">
            {trainees.map((trainee) => (
              <div key={`${trainee.student_id}-${trainee.internship_id}`} className="trainee-card">
                <div className="trainee-header">
                  <h3>{trainee.first_name} {trainee.last_name}</h3>
                  <span className="status-badge status-active">Actif</span>
                </div>
                
                <div className="trainee-details">
                  <p><strong>Email:</strong> {trainee.email}</p>
                  {trainee.matricule && <p><strong>Matricule:</strong> {trainee.matricule}</p>}
                  {trainee.student_speciality && <p><strong>Spécialité:</strong> {trainee.student_speciality}</p>}
                  {trainee.academic_year && <p><strong>Année académique:</strong> {trainee.academic_year}</p>}
                  <p><strong>Stage:</strong> {trainee.internship_title || 'N/A'}</p>
                  <p><strong>Hôpital:</strong> {trainee.hospital || 'N/A'}</p>
                  {trainee.startDate && (
                    <p><strong>Date de début:</strong> {new Date(trainee.startDate).toLocaleDateString('fr-FR')}</p>
                  )}
                  {trainee.endDate && (
                    <p><strong>Date de fin:</strong> {new Date(trainee.endDate).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>

                <div className="trainee-actions">
                  <Link to={`/internships/${trainee.internship_id}`} className="view-btn">
                    Voir le stage
                  </Link>
                  <Link to={`/doctor/evaluations?student=${trainee.student_id}&internship=${trainee.internship_id}`} className="evaluate-btn">
                    Évaluer
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

export default MyTrainees;
