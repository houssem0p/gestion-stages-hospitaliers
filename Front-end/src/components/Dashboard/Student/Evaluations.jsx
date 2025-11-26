import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import authAPI from '../../../services/api';
import './Evaluations.css';

const Evaluations = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('evaluations');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real data states
  const [internships, setInternships] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [reports, setReports] = useState([]);
  const [studentInfo, setStudentInfo] = useState({});
  const [templates, setTemplates] = useState({}); // Store templates by internship ID

  // Fetch student's internships
  const fetchStudentInternships = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const res = await authAPI.get(`/students/${user.id}/internships`);
      setInternships(res.data.data || []);
    } catch (err) {
      console.error('Failed to load internships', err);
      setError('Erreur lors du chargement des stages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch evaluations for student
  const fetchEvaluations = async () => {
    if (!user?.id) return;
    
    try {
      const res = await authAPI.get(`/evaluations/student/${user.id}`);
      setEvaluations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load evaluations', err);
    }
  };

  // Fetch reports for student
  const fetchReports = async () => {
    if (!user?.id) return;
    
    try {
      const res = await authAPI.get(`/reports/student/${user.id}`);
      setReports(res.data.data || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    }
  };

  // Fetch student profile info
  const fetchStudentInfo = async () => {
    if (!user?.id) return;
    
    try {
      const res = await authAPI.get(`/students/${user.id}/profile`);
      setStudentInfo(res.data.data || {});
    } catch (err) {
      console.error('Failed to load student info', err);
    }
  };

  // Fetch evaluation template for an internship
  const fetchEvaluationTemplate = async (internshipId) => {
    try {
      const res = await authAPI.get(`/evaluations/template/${internshipId}`);
      if (res.data.success && res.data.data) {
        setTemplates(prev => ({
          ...prev,
          [internshipId]: res.data.data
        }));
      }
    } catch (err) {
      console.error(`Failed to load template for internship ${internshipId}`, err);
    }
  };

  // Fetch templates for all completed internships
  const fetchAllTemplates = async () => {
    const completedInternships = internships.filter(internship => 
      getInternshipStatus(internship) === 'completed'
    );
    
    for (const internship of completedInternships) {
      await fetchEvaluationTemplate(internship.id);
    }
  };

  useEffect(() => {
    fetchStudentInternships();
    fetchEvaluations();
    fetchReports();
    fetchStudentInfo();
  }, [user?.id]);

  // Fetch templates when internships are loaded
  useEffect(() => {
    if (internships.length > 0) {
      fetchAllTemplates();
    }
  }, [internships]);

  // Get evaluation for selected internship
  const getEvaluationForInternship = (internshipId) => {
    return evaluations.find(evItem => evItem.internship_id === internshipId);
  };

  // Get template for selected internship
  const getTemplateForInternship = (internshipId) => {
    return templates[internshipId];
  };

  // Get report for selected internship
  const getReportForInternship = (internshipId) => {
    return reports.find(report => report.internship_id === internshipId);
  };

  // Determine internship status based on dates
  const getInternshipStatus = (internship) => {
    const now = new Date();
    const startDate = new Date(internship.startDate);
    const endDate = new Date(internship.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'in-progress';
  };

  // Format period display
  const formatPeriod = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Evaluation Section with templates
  const EvaluationSection = () => (
    <div className="section-content">
      <div className="section-header">
        <h3>Évaluations des Stages</h3>
        <p>Consultez vos évaluations et les critères d'évaluation pour chaque stage</p>
      </div>

      {loading && <div className="loading">Chargement des stages...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="internships-grid">
        {internships.map(internship => {
          const evaluation = getEvaluationForInternship(internship.id);
          const template = getTemplateForInternship(internship.id);
          const status = getInternshipStatus(internship);
          
          return (
            <div 
              key={internship.id} 
              className={`internship-card ${status} ${selectedInternship === internship.id ? 'selected' : ''}`}
              onClick={() => setSelectedInternship(internship.id)}
            >
              <div className="internship-header">
                <h4>{internship.title}</h4>
                <span className={`status-badge ${status}`}>
                  {status === 'completed' ? 'Terminé' : 
                   status === 'in-progress' ? 'En cours' : 'À venir'}
                </span>
              </div>
              <p className="hospital">{internship.hospital}</p>
              <p className="period">{formatPeriod(internship.startDate, internship.endDate)}</p>
              {internship.doctor_first_name && (
                <p className="doctor">Encadrant: Dr. {internship.doctor_first_name} {internship.doctor_last_name}</p>
              )}
              
              {evaluation ? (
                <div className="evaluation-preview">
                  <div className="final-grade">
                    Note: <strong>{evaluation.final_grade}</strong>
                  </div>
                  <span className="view-evaluation">Voir l'évaluation →</span>
                </div>
              ) : template ? (
                <div className="evaluation-preview">
                  <span className="template-available">📋 Grille d'évaluation disponible</span>
                  <small>{template.criteria?.length || 0} critères définis</small>
                </div>
              ) : status === 'completed' ? (
                <div className="evaluation-preview">
                  <span className="no-evaluation">⏳ Évaluation en attente</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectedInternship && (
        <EvaluationDetail 
          evaluation={getEvaluationForInternship(selectedInternship)} 
          template={getTemplateForInternship(selectedInternship)}
          internship={internships.find(i => i.id === selectedInternship)}
        />
      )}
    </div>
  );

  // Updated Evaluation Detail Component to show templates
  const EvaluationDetail = ({ evaluation, template, internship }) => {
    const hasEvaluation = !!evaluation;
    const hasTemplate = !!template;

    return (
      <div className="evaluation-detail">
        <h4>Détails - {internship?.title}</h4>
        <div className="evaluation-meta-info">
          <p><strong>Hôpital:</strong> {internship?.hospital}</p>
          <p><strong>Période:</strong> {formatPeriod(internship?.startDate, internship?.endDate)}</p>
          {evaluation && (
            <p><strong>Date d'évaluation:</strong> {new Date(evaluation.updated_at).toLocaleDateString('fr-FR')}</p>
          )}
        </div>

        {hasEvaluation ? (
          <EvaluationResults evaluation={evaluation} />
        ) : hasTemplate ? (
          <TemplatePreview template={template} />
        ) : (
          <div className="no-data">
            <h5>📊 Aucune donnée d'évaluation disponible</h5>
            <p>Votre encadrant n'a pas encore complété l'évaluation pour ce stage.</p>
            <p>La grille d'évaluation sera affichée ici une fois l'évaluation effectuée.</p>
          </div>
        )}
      </div>
    );
  };

  // Component to show actual evaluation results
  const EvaluationResults = ({ evaluation }) => {
    // Scores come from evaluation_scores table as an array
    const scores = Array.isArray(evaluation.scores) ? evaluation.scores : [];

    // Group scores by category
    const scoresByCategory = {};
    scores.forEach(scoreData => {
      const category = scoreData.category || 'General';
      if (!scoresByCategory[category]) {
        scoresByCategory[category] = [];
      }
      scoresByCategory[category].push(scoreData);
    });

    return (
      <>
        <div className="evaluation-header">
          <h5>📈 Résultats de l'Évaluation</h5>
        </div>

        {scores && scores.length > 0 ? (
          <div className="evaluation-grid">
            {Object.entries(scoresByCategory).map(([category, categoryScores]) => (
              <div key={category} className="criteria-card">
                <h5>{category}</h5>
                <div className="points-list">
                  {categoryScores.map((scoreData) => (
                    <div key={scoreData.criteria_id || scoreData.id} className="point-item">
                      <div className="point-header">
                        <span className="point-text">{scoreData.criteria_text}</span>
                        {scoreData.description && (
                          <small className="criteria-desc">{scoreData.description}</small>
                        )}
                      </div>
                      <div className="score-display">
                        {scoreData.criteria_type === 'scale' && scoreData.score !== null ? (
                          <>
                            {Array.from({length: scoreData.max_score || 5}, (_, i) => (
                              <span 
                                key={i} 
                                className={`score-dot ${i < scoreData.score ? 'filled' : ''}`}
                              />
                            ))}
                            <span className="score-value">({scoreData.score}/{scoreData.max_score || 5})</span>
                          </>
                        ) : scoreData.criteria_type === 'text' && scoreData.text_response ? (
                          <div className="text-response">
                            <p>{scoreData.text_response}</p>
                          </div>
                        ) : scoreData.criteria_type === 'boolean' && scoreData.text_response ? (
                          <span className="boolean-response">
                            {scoreData.text_response === 'true' ? '✓ Oui' : '✗ Non'}
                          </span>
                        ) : (
                          <span className="no-score">Non évalué</span>
                        )}
                      </div>
                      {scoreData.comments && (
                        <div className="score-comments">
                          <small>Commentaire: {scoreData.comments}</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-scores">
            Aucun détail de score disponible pour cette évaluation.
          </div>
        )}
        
        <div className="evaluation-comments">
          <h5>💬 Commentaires du Médecin</h5>
          <p>{evaluation.comments || "Aucun commentaire fourni."}</p>
          <div className="evaluation-meta">
            <span>Note finale: <strong>{evaluation.final_grade || 'N/A'}</strong></span>
          </div>
        </div>
      </>
    );
  };

  // Component to show template preview (when no evaluation exists)
  const TemplatePreview = ({ template }) => {
    return (
      <>
        <div className="template-header">
          <h5>📋 Grille d'Évaluation</h5>
          <p className="template-description">{template.description || "Critères d'évaluation pour ce stage"}</p>
          <div className="template-status">
            <span className="status-awaiting">⏳ En attente d'évaluation par votre encadrant</span>
          </div>
        </div>

        {template.criteria && template.criteria.length > 0 ? (
          <div className="template-grid">
            {/* Group criteria by category */}
            {Object.entries(
              template.criteria.reduce((acc, criteria) => {
                const category = criteria.category || 'Général';
                if (!acc[category]) acc[category] = [];
                acc[category].push(criteria);
                return acc;
              }, {})
            ).map(([category, criteriaList]) => (
              <div key={category} className="criteria-card template">
                <h5>{category}</h5>
                <div className="points-list">
                  {criteriaList.map((criteria, index) => (
                    <div key={criteria.id || index} className="point-item template">
                      <span className="point-text">{criteria.criteria_text}</span>
                      <div className="score-display template">
                        {Array.from({length: criteria.max_score || 5}, (_, i) => (
                          <span 
                            key={i} 
                            className="score-dot empty"
                            title={`Score maximum: ${criteria.max_score || 5}`}
                          />
                        ))}
                        <span className="score-info">
                          ({criteria.max_score || 5} points max)
                        </span>
                      </div>
                      {criteria.description && (
                        <div className="criteria-description">
                          <small>{criteria.description}</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-criteria">
            Aucun critère défini pour cette grille d'évaluation.
          </div>
        )}

        <div className="template-footer">
          <p>
            <strong>Note:</strong> Cette grille montre les critères sur lesquels vous serez évalué. 
            Votre encadrant remplira cette évaluation une fois le stage terminé.
          </p>
        </div>
      </>
    );
  };

  // Rest of your components (AttestationSection, ReportSection) remain the same...
  const AttestationSection = () => {
    // ... your existing AttestationSection code
    return (
      <div className="section-content">
        {/* Your existing attestation content */}
      </div>
    );
  };

  const ReportSection = () => {
    // ... your existing ReportSection code
    return (
      <div className="section-content">
        {/* Your existing report content */}
      </div>
    );
  };

  return (
    <div className="evaluations-page">
      <div className="page-header">
        <h1>Évaluations & Attestations & Rapports</h1>
        <p>Gérez vos évaluations, attestations et rapports de stage</p>
      </div>

      <div className="navigation-tabs">
        <button 
          className={`tab ${activeSection === 'evaluations' ? 'active' : ''}`}
          onClick={() => setActiveSection('evaluations')}
        >
          📊 Évaluations
        </button>
        <button 
          className={`tab ${activeSection === 'attestations' ? 'active' : ''}`}
          onClick={() => setActiveSection('attestations')}
        >
          📄 Attestations
        </button>
        <button 
          className={`tab ${activeSection === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveSection('reports')}
        >
          📝 Rapports
        </button>
      </div>

      <div className="content-section">
        {activeSection === 'evaluations' && <EvaluationSection />}
        {activeSection === 'attestations' && <AttestationSection />}
        {activeSection === 'reports' && <ReportSection />}
      </div>
    </div>
  );
};

export default Evaluations;