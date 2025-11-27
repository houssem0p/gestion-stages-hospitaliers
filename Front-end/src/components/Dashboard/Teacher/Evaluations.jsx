import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import authAPI from '../../../services/api';
import './Evaluations.css';

const Evaluations = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchInternships();
    }
  }, [user?.id]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authAPI.get('/evaluations/teacher/internships');
      if (res.data.success) {
        setInternships(res.data.data || []);
      } else {
        setError(res.data.message || 'Failed to load internships');
      }
    } catch (err) {
      console.error('Failed to load internships', err);
      setError('Erreur lors du chargement des stages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="teacher-evaluations-page">
      <div className="page-header">
        <h2>📋 Évaluations & Rapports des Stages</h2>
        <p>Consultez les rapports des étudiants et les évaluations des médecins pour chaque stage</p>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '12px', 
          background: '#ffeaea', 
          color: '#d63031', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Chargement des stages...</div>
      ) : internships.length === 0 ? (
        <div className="empty-state">
          <p>Aucun stage assigné pour le moment.</p>
        </div>
      ) : (
        <div className="internships-grid">
          {internships.map((internship) => (
            <div
              key={internship.internship_id}
              className={`internship-card ${selectedInternship?.internship_id === internship.internship_id ? 'selected' : ''}`}
              onClick={() => setSelectedInternship(internship)}
            >
              <div className="internship-header">
                <h3>{internship.title}</h3>
                <span className="status-badge">
                  {internship.startDate && new Date(internship.startDate) > new Date() ? 'À venir' :
                   internship.endDate && new Date(internship.endDate) < new Date() ? 'Terminé' : 'En cours'}
                </span>
              </div>
              
              <div className="internship-info">
                <p><strong>Hôpital:</strong> {internship.hospital}</p>
                <p><strong>Spécialité:</strong> {internship.speciality}</p>
                <p><strong>Période:</strong> {formatDate(internship.startDate)} - {formatDate(internship.endDate)}</p>
              </div>

              <div className="participants-info">
                <div className="participant-item">
                  <strong>👨‍🎓 Étudiant:</strong> {internship.student_first_name} {internship.student_last_name}
                  {internship.matricule && <span> ({internship.matricule})</span>}
                </div>
                {internship.doctor_first_name && (
                  <div className="participant-item">
                    <strong>👨‍⚕️ Médecin:</strong> Dr. {internship.doctor_first_name} {internship.doctor_last_name}
                  </div>
                )}
              </div>

              <div className="evaluation-status">
                <div className="status-item">
                  <span className={`status-indicator ${internship.report ? 'completed' : 'pending'}`}></span>
                  <span>Rapport étudiant: {internship.report ? '✓ Soumis' : '✗ Non soumis'}</span>
                </div>
                <div className="status-item">
                  <span className={`status-indicator ${internship.evaluation ? 'completed' : 'pending'}`}></span>
                  <span>Évaluation médecin: {internship.evaluation ? '✓ Complétée' : '✗ En attente'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedInternship && (
        <div className="detail-panel">
          <div className="detail-header">
            <h3>{selectedInternship.title}</h3>
            <button className="close-btn" onClick={() => setSelectedInternship(null)}>✕</button>
          </div>

          <div className="detail-content">
            {/* Student Report Section */}
            <div className="section">
              <h4>📄 Rapport de l'Étudiant</h4>
              {selectedInternship.report ? (
                <div className="report-content">
                  <div className="report-meta">
                    <p><strong>Titre:</strong> {selectedInternship.report.title}</p>
                    <p><strong>Statut:</strong> {selectedInternship.report.status}</p>
                    <p><strong>Date de soumission:</strong> {formatDate(selectedInternship.report.submission_date || selectedInternship.report.created_at)}</p>
                  </div>
                  <div className="report-body">
                    <h5>Contenu:</h5>
                    <pre>{selectedInternship.report.content || 'Aucun contenu'}</pre>
                  </div>
                  {selectedInternship.report.file_url && (
                    <div className="report-file">
                      <a 
                        href={authAPI.defaults.baseURL.replace('/api', '') + selectedInternship.report.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        📎 Voir le fichier joint
                      </a>
                    </div>
                  )}
                  {selectedInternship.report.feedback && (
                    <div className="report-feedback">
                      <h5>Retour:</h5>
                      <p>{selectedInternship.report.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data">
                  <p>Aucun rapport soumis par l'étudiant pour ce stage.</p>
                </div>
              )}
            </div>

            {/* Doctor Evaluation Section */}
            <div className="section">
              <h4>⭐ Évaluation du Médecin</h4>
              {selectedInternship.evaluation ? (
                <div className="evaluation-content">
                  <div className="evaluation-meta">
                    <p><strong>Médecin évaluateur:</strong> Dr. {selectedInternship.doctor_first_name} {selectedInternship.doctor_last_name}</p>
                    <p><strong>Date d'évaluation:</strong> {formatDate(selectedInternship.evaluation.created_at)}</p>
                    {selectedInternship.evaluation.final_grade && (
                      <p><strong>Note finale:</strong> <span className="final-grade">{selectedInternship.evaluation.final_grade}</span></p>
                    )}
                  </div>

                  {selectedInternship.evaluation.comments && (
                    <div className="evaluation-comments">
                      <h5>Commentaires:</h5>
                      <pre>{selectedInternship.evaluation.comments}</pre>
                    </div>
                  )}

                  {/* Evaluation Scores */}
                  {selectedInternship.evaluation.scores && selectedInternship.evaluation.scores.length > 0 && (
                    <div className="evaluation-scores">
                      <h5>Détails des scores:</h5>
                      <table className="scores-table">
                        <thead>
                          <tr>
                            <th>Catégorie</th>
                            <th>Critère</th>
                            <th>Score</th>
                            <th>Max</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInternship.evaluation.scores.map((score, idx) => (
                            <tr key={idx}>
                              <td>{score.category}</td>
                              <td>{score.criteria_text}</td>
                              <td>
                                {score.criteria_type === 'text' || score.criteria_type === 'boolean' 
                                  ? score.text_response || 'N/A'
                                  : `${score.score || 0} / ${score.max_score || 0}`}
                              </td>
                              <td>{score.max_score || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data">
                  <p>L'évaluation du médecin n'est pas encore disponible pour ce stage.</p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="section summary-section">
              <h4>📊 Résumé</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <strong>Étudiant:</strong>
                  <p>{selectedInternship.student_first_name} {selectedInternship.student_last_name}</p>
                  {selectedInternship.matricule && <p>Matricule: {selectedInternship.matricule}</p>}
                  {selectedInternship.student_speciality && <p>Spécialité: {selectedInternship.student_speciality}</p>}
                  {selectedInternship.academic_year && <p>Année: {selectedInternship.academic_year}</p>}
                </div>
                <div className="summary-item">
                  <strong>Médecin superviseur:</strong>
                  {selectedInternship.doctor_first_name ? (
                    <p>Dr. {selectedInternship.doctor_first_name} {selectedInternship.doctor_last_name}</p>
                  ) : (
                    <p>Non assigné</p>
                  )}
                </div>
                <div className="summary-item">
                  <strong>Hôpital:</strong>
                  <p>{selectedInternship.hospital}</p>
                </div>
                <div className="summary-item">
                  <strong>Période:</strong>
                  <p>{formatDate(selectedInternship.startDate)} - {formatDate(selectedInternship.endDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluations;
