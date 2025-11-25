import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import authAPI from '../../../services/api';
import './DoctorEvaluations.css';

const DoctorEvaluations = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState({ 
    internships: false, 
    applicants: false,
    template: false,
    evaluation: false
  });
  const [currentEval, setCurrentEval] = useState({});
  const [evaluationTemplate, setEvaluationTemplate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchInternships();
    }
  }, [user?.id]);

  const showMessage = (message, type = 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(prev => ({ ...prev, internships: true }));
      setError('');
      
      const res = await authAPI.get('/doctors/internships');
      
      if (res.data.success) {
        setInternships(res.data.data || []);
        if (res.data.data.length === 0) {
          showMessage('Aucun stage trouvé pour ce médecin', 'info');
        }
      } else {
        showMessage(res.data.message || 'Erreur lors du chargement des stages');
      }
    } catch (err) {
      console.error('Failed to load internships for doctor', err);
      showMessage('Erreur de connexion au serveur');
    } finally { 
      setLoading(prev => ({ ...prev, internships: false }));
    }
  };

  const openInternship = async (internship) => {
    setSelectedInternship(internship);
    setCurrentEval({});
    setEvaluationTemplate(null);
    
    try {
      setLoading(prev => ({ ...prev, applicants: true }));
      
      const res = await authAPI.get(`/doctors/internship/${internship.id}/applicants`);
      
      if (res.data.success) {
        setApplicants(res.data.data || []);
      } else {
        showMessage(res.data.message || 'Erreur lors du chargement des candidats');
        setApplicants([]);
      }
    } catch (err) {
      console.error('Failed to load applicants', err);
      showMessage('Erreur lors du chargement des candidats');
      setApplicants([]);
    } finally { 
      setLoading(prev => ({ ...prev, applicants: false }));
    }
  };

  const loadEvaluationTemplate = async (internshipId) => {
    try {
      setLoading(prev => ({ ...prev, template: true }));
      const res = await authAPI.get(`/evaluations/template/${internshipId}`);
      
      if (res.data.success && res.data.data) {
        console.log('Loaded evaluation template:', res.data.data);
        setEvaluationTemplate(res.data.data);
        return res.data.data;
      } else {
        showMessage('Aucun modèle d\'évaluation trouvé pour ce stage', 'error');
        return null;
      }
    } catch (err) {
      console.error('Failed to load evaluation template', err);
      showMessage('Erreur lors du chargement du modèle d\'évaluation');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, template: false }));
    }
  };

  const startEvaluation = async (student) => {
    try {
      setLoading(prev => ({ ...prev, template: true }));
      
      // Load the existing evaluation template for this internship
      const template = await loadEvaluationTemplate(selectedInternship.id);
      
      if (!template) {
        showMessage('Impossible de charger le modèle d\'évaluation');
        return;
      }

      // Check for existing evaluation
      let existingEvaluation = null;
      try {
        const evalRes = await authAPI.get(
          `/evaluations/internship/${selectedInternship.id}?studentId=${student.student_id}`
        );
        existingEvaluation = evalRes.data.data && evalRes.data.data.length > 0 ? evalRes.data.data[0] : null;
      } catch (err) {
        console.log('No existing evaluation found');
      }

      // Initialize scores from existing evaluation or create new ones
      const initialScores = {};
      if (existingEvaluation && existingEvaluation.scores) {
        // Parse existing scores
        try {
          const existingScores = typeof existingEvaluation.scores === 'string' 
            ? JSON.parse(existingEvaluation.scores) 
            : existingEvaluation.scores;
          
          // Map existing scores to criteria
          template.criteria.forEach(criterion => {
            // Try to find the score for this criterion
            let foundScore = null;
            
            // Check if scores are organized by category
            if (existingScores[criterion.category]) {
              foundScore = existingScores[criterion.category][criterion.criteria_text];
            } else {
              // Check if scores are flat
              Object.values(existingScores).forEach(categoryScores => {
                if (typeof categoryScores === 'object' && categoryScores[criterion.criteria_text]) {
                  foundScore = categoryScores[criterion.criteria_text];
                }
              });
            }
            
            initialScores[criterion.id] = foundScore || '';
          });
        } catch (parseError) {
          console.error('Error parsing existing scores:', parseError);
          // Initialize empty scores if parsing fails
          template.criteria.forEach(criterion => {
            initialScores[criterion.id] = '';
          });
        }
      } else {
        // Initialize empty scores
        template.criteria.forEach(criterion => {
          initialScores[criterion.id] = '';
        });
      }

      setCurrentEval({
        internship_id: selectedInternship.id,
        student_id: student.student_id,
        doctor_id: user.id,
        student_name: `${student.first_name} ${student.last_name}`,
        student_email: student.email,
        comments: existingEvaluation?.comments || '',
        final_grade: existingEvaluation?.final_grade || '',
        scores: initialScores,
        existing: !!existingEvaluation,
        evaluation_id: existingEvaluation?.id,
        template: template
      });
      
    } catch (err) {
      console.error('Failed to start evaluation', err);
      showMessage('Erreur lors du démarrage de l\'évaluation');
    } finally {
      setLoading(prev => ({ ...prev, template: false }));
    }
  };

  const handleScoreChange = (criteriaId, value) => {
    setCurrentEval(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [criteriaId]: value
      }
    }));
  };

  const calculateFinalGrade = (scores, template) => {
    if (!scores || !template || !template.criteria) return 0;
    
    let totalWeight = 0;
    let weightedSum = 0;
    let validCriteriaCount = 0;
    
    template.criteria.forEach(criterion => {
      const score = parseFloat(scores[criterion.id]);
      if (!isNaN(score) && score >= 0 && score <= criterion.max_score) {
        const weight = criterion.weight || 1.0;
        weightedSum += (score / criterion.max_score) * weight * 20; // Convert to /20
        totalWeight += weight;
        validCriteriaCount++;
      }
    });
    
    // Only return calculated grade if we have valid scores
    if (validCriteriaCount > 0 && totalWeight > 0) {
      return (weightedSum / totalWeight).toFixed(1);
    }
    return 0;
  };

  const submitEvaluation = async () => {
    if (!currentEval.template || !currentEval.template.criteria) {
      showMessage('Modèle d\'évaluation non chargé');
      return;
    }

    // Validation
    const missingScores = [];
    const invalidScores = [];
    
    currentEval.template.criteria.forEach(criterion => {
      const score = currentEval.scores[criterion.id];
      
      // Check for missing required scores
      if (criterion.is_required && (!score || score === '')) {
        missingScores.push(criterion.criteria_text);
      }
      
      // Check for invalid scores
      if (score && score !== '') {
        const numScore = parseFloat(score);
        if (isNaN(numScore) || numScore < 0 || numScore > criterion.max_score) {
          invalidScores.push(`${criterion.criteria_text} (0-${criterion.max_score})`);
        }
      }
    });

    if (missingScores.length > 0) {
      showMessage(`Critères obligatoires non remplis: ${missingScores.join(', ')}`);
      return;
    }

    if (invalidScores.length > 0) {
      showMessage(`Scores invalides pour: ${invalidScores.join(', ')}`);
      return;
    }

    if (!currentEval.comments?.trim()) {
      showMessage('Veuillez saisir des commentaires');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, evaluation: true }));
      
      // Calculate final grade
      const finalGrade = calculateFinalGrade(currentEval.scores, currentEval.template);
      
      // Format scores for backend in the structure your API expects
      const formattedScores = {};
      currentEval.template.criteria.forEach(criterion => {
        const category = criterion.category;
        if (!formattedScores[category]) {
          formattedScores[category] = {};
        }
        const scoreValue = parseFloat(currentEval.scores[criterion.id]) || 0;
        formattedScores[category][criterion.criteria_text] = scoreValue;
      });

      const payload = {
        internship_id: currentEval.internship_id,
        student_id: currentEval.student_id,
        doctor_id: currentEval.doctor_id,
        template_id: currentEval.template.id,
        scores: formattedScores,
        comments: currentEval.comments.trim(),
        final_grade: finalGrade
      };

      console.log('Submitting evaluation payload:', payload);

      const endpoint = currentEval.existing && currentEval.evaluation_id 
        ? `/evaluations/${currentEval.evaluation_id}`
        : '/evaluations';
      
      const method = currentEval.existing ? 'put' : 'post';
      
      const res = await authAPI[method](endpoint, payload);
      
      if (res.data.success) {
        showMessage(
          `Évaluation ${currentEval.existing ? 'mise à jour' : 'enregistrée'} avec succès`, 
          'success'
        );
        
        // Refresh and close
        openInternship(selectedInternship);
        setCurrentEval({});
      } else {
        showMessage(res.data.message || 'Erreur lors de l\'enregistrement');
      }
      
    } catch (err) {
      console.error('Failed to submit evaluation', err);
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'évaluation';
      showMessage(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, evaluation: false }));
    }
  };

  const cancelEvaluation = () => {
    setCurrentEval({});
  };

  const getCriteriaByCategory = (criteria) => {
    const categories = {};
    if (!criteria) return categories;
    
    criteria.forEach(criterion => {
      if (!categories[criterion.category]) {
        categories[criterion.category] = [];
      }
      categories[criterion.category].push(criterion);
    });
    return categories;
  };

  const renderScoreInput = (criterion) => {
    switch (criterion.criteria_type) {
      case 'scale':
        return (
          <div className="score-input">
            <input
              type="number"
              min="0"
              max={criterion.max_score}
              step="0.1"
              value={currentEval.scores[criterion.id] || ''}
              onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
              placeholder={`0-${criterion.max_score}`}
              className="score-field"
            />
            <span className="score-max">/ {criterion.max_score}</span>
          </div>
        );
      
      case 'text':
        return (
          <textarea
            value={currentEval.scores[criterion.id] || ''}
            onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
            placeholder="Saisissez votre évaluation..."
            rows="3"
            className="text-score-field"
          />
        );
      
      case 'boolean':
        return (
          <select
            value={currentEval.scores[criterion.id] || ''}
            onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
            className="boolean-score-field"
          >
            <option value="">Sélectionnez</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        );
      
      default:
        return (
          <div className="score-input">
            <input
              type="number"
              min="0"
              max={criterion.max_score}
              step="0.1"
              value={currentEval.scores[criterion.id] || ''}
              onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
              placeholder={`0-${criterion.max_score}`}
              className="score-field"
            />
            <span className="score-max">/ {criterion.max_score}</span>
          </div>
        );
    }
  };

  return (
    <div className="doctor-evaluations-page">
      <h2>Mes Stagiaires & Évaluations</h2>
      
      {error && (
        <div className="message error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="message success">
          {success}
        </div>
      )}

      <div className="doctor-layout">
        {/* Left Pane - Internships */}
        <div className="doctor-left-pane">
          <h3>Mes Stages</h3>
          
          {loading.internships && (
            <div className="doctor-loading">Chargement des stages...</div>
          )}
          
          <ul className="doctor-internship-list">
            {internships.map(internship => (
              <li 
                key={internship.id} 
                className={`doctor-internship-item ${selectedInternship?.id === internship.id ? 'active' : ''}`} 
                onClick={() => openInternship(internship)}
              >
                <strong>{internship.title}</strong>
                <div className="meta">
                  {internship.hospital_name || internship.hospital} • 
                  {internship.start_date || internship.startDate} - {internship.end_date || internship.endDate}
                </div>
                {internship.applicant_count > 0 && (
                  <div className="applicant-count">
                    {internship.applicant_count} candidat(s)
                  </div>
                )}
              </li>
            ))}
            
            {internships.length === 0 && !loading.internships && (
              <li className="no-data">Aucun stage assigné.</li>
            )}
          </ul>
        </div>

        {/* Right Pane - Applicants and Evaluation */}
        <div className="doctor-right-pane">
          {!selectedInternship ? (
            <div className="placeholder">
              Sélectionnez un stage pour voir les candidats
            </div>
          ) : (
            <div className="applicants-container">
              <div className="section-header">
                <h3>{selectedInternship.title} — Candidats</h3>
                <button 
                  onClick={() => openInternship(selectedInternship)}
                  className="refresh-btn"
                  disabled={loading.applicants}
                >
                  {loading.applicants ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>
              
              {loading.applicants && (
                <div className="doctor-loading">Chargement des candidats...</div>
              )}
              
              <ul className="doctor-applicants-list">
                {applicants.map(applicant => (
                  <li key={applicant.application_id} className="doctor-applicant-item">
                    <div className="applicant-info">
                      <strong>{applicant.first_name} {applicant.last_name}</strong>
                      <div className="small">{applicant.email}</div>
                      <div className="application-status">
                        Statut: {applicant.application_status || 'En attente'}
                      </div>
                    </div>
                    <div className="doctor-actions">
                      <button 
                        onClick={() => startEvaluation(applicant)}
                        disabled={loading.template}
                        className="btn-evaluate"
                      >
                        {loading.template ? 'Chargement...' : 'Évaluer'}
                      </button>
                    </div>
                  </li>
                ))}
                
                {applicants.length === 0 && !loading.applicants && (
                  <li className="no-data">Aucun candidat pour ce stage.</li>
                )}
              </ul>

              {/* Evaluation Form with Template */}
              {currentEval && currentEval.student_id && currentEval.template && (
                <div className="doctor-evaluation-form">
                  <div className="evaluation-header">
                    <h4>
                      Évaluation de {currentEval.student_name}
                      {currentEval.existing && <span className="edit-badge"> (Modification)</span>}
                    </h4>
                    <button onClick={cancelEvaluation} className="btn-close">×</button>
                  </div>
                  
                  <div className="template-info">
                    <h5>Modèle d'évaluation: {currentEval.template.template_name}</h5>
                    {currentEval.template.description && (
                      <p className="template-description">{currentEval.template.description}</p>
                    )}
                  </div>

                  {/* Evaluation Criteria by Category */}
                  {Object.entries(getCriteriaByCategory(currentEval.template.criteria)).map(([category, criteria]) => (
                    <div key={category} className="evaluation-category">
                      <h6>{category}</h6>
                      <div className="criteria-list">
                        {criteria.map(criterion => (
                          <div key={criterion.id} className="criterion-item">
                            <div className="criterion-header">
                              <label className="criterion-label">
                                {criterion.criteria_text}
                                {criterion.is_required && <span className="required">*</span>}
                              </label>
                              {renderScoreInput(criterion)}
                            </div>
                            {criterion.description && (
                              <div className="criterion-description">
                                {criterion.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Comments and Final Grade */}
                  <div className="evaluation-summary">
                    <div className="doctor-form-row">
                      <label>Commentaires généraux *</label>
                      <textarea 
                        value={currentEval.comments || ''} 
                        onChange={(e) => setCurrentEval(prev => ({...prev, comments: e.target.value}))}
                        rows="4"
                        placeholder="Commentaires sur le stage, points forts, axes d'amélioration..."
                      />
                    </div>
                    
                    <div className="final-grade-section">
                      <div className="grade-display">
                        <label>Note finale calculée:</label>
                        <div className="final-grade">
                          {calculateFinalGrade(currentEval.scores, currentEval.template)}/20
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="doctor-form-actions">
                    <button 
                      onClick={submitEvaluation}
                      disabled={loading.evaluation}
                      className="btn-save"
                    >
                      {loading.evaluation ? 'Enregistrement...' : 
                       currentEval.existing ? 'Mettre à jour' : 'Enregistrer l\'évaluation'}
                    </button>
                    <button 
                      onClick={cancelEvaluation}
                      disabled={loading.evaluation}
                      className="btn-cancel"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorEvaluations;