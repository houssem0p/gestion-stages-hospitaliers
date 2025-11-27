import React, { useEffect, useState } from 'react';
import authAPI from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const ReceivedApplications = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [studentDocuments, setStudentDocuments] = useState({});
  const [documentsLoading, setDocumentsLoading] = useState({});
  const [showDocumentsFor, setShowDocumentsFor] = useState(null);

  const hospitalId = user?.hospital_id;

  useEffect(() => {
    if (!hospitalId) return;
    const loadInternships = async () => {
      try {
        setLoading(true);
        const res = await authAPI.get(`/hospitals/${hospitalId}/internships`);
        console.debug('Loaded internships:', res.data.data);
        setInternships(res.data.data || []);
      } catch (err) {
        console.error('Failed to load internships', err);
      } finally {
        setLoading(false);
      }
    };
    loadInternships();
  }, [hospitalId]);

  const loadApplications = async (internshipId) => {
    setSelectedInternship(internshipId);
    setLoading(true);
    try {
      const res = await authAPI.get(`/internships/${internshipId}/applications`);
      console.debug('Applications loaded:', res.data.data);
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load applications', err);
      setApplications([]);
      alert('Failed to load applications: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;
    
    try {
      await authAPI.post(`/internships/applications/${appId}/status`, { status });
      alert(`Application ${status} successfully`);
      // Reload applications to show updated status
      if (selectedInternship) loadApplications(selectedInternship);
    } catch (err) {
      console.error(err);
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const viewStudentProfile = async (studentId) => {
    try {
      setProfileLoading(true);
      setSelectedStudentProfile(null);
      const res = await authAPI.get(`/students/${studentId}/profile`);
      setSelectedStudentProfile(res.data.data || null);
    } catch (err) {
      console.error('Failed to load student profile', err);
      alert('Impossible de charger le profil étudiant');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadStudentDocuments = async (studentId) => {
    // Always set showDocumentsFor to toggle/show the documents section
    const studentIdStr = String(studentId);
    if (showDocumentsFor === studentIdStr) {
      // If already showing, hide it
      setShowDocumentsFor(null);
      return;
    }
    
    setShowDocumentsFor(studentIdStr);
    
    // If documents are already loaded, just show them
    if (studentDocuments[studentId]) {
      return;
    }
    
    try {
      setDocumentsLoading(prev => ({ ...prev, [studentId]: true }));
      const res = await authAPI.get(`/students/${studentId}/documents`);
      setStudentDocuments(prev => ({ ...prev, [studentId]: res.data.data || [] }));
    } catch (err) {
      console.error('Failed to load student documents', err);
      alert('Erreur lors du chargement des documents: ' + (err.response?.data?.message || err.message));
      setStudentDocuments(prev => ({ ...prev, [studentId]: [] }));
    } finally {
      setDocumentsLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#ff9800';
    }
  };

  const getDisplayText = (app) => {
    // Use cover_letter first, then application_text, then fallback message
    return app.cover_letter || app.application_text || 'Aucune lettre de motivation fournie';
  };

  return (
    <div className="page">
      <h2>Candidatures reçues</h2>

      {!hospitalId && (
        <div style={{ color: 'crimson', padding: '10px', background: '#ffeaea', borderRadius: '4px' }}>
          Votre compte n'est pas rattaché à un hôpital.
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        {/* Internships List */}
        <div style={{ width: 300, background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
          <h4>Offres de stage</h4>
          {loading && <div>Chargement...</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {internships.map(i => (
              <li key={i.id} style={{ marginBottom: 8 }}>
                <button 
                  onClick={() => loadApplications(i.id)} 
                  style={{ 
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    border: '1px solid #ddd',
                    background: selectedInternship === i.id ? '#e3f2fd' : 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{i.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{i.hospital}</div>
                </button>
              </li>
            ))}
          </ul>
          {internships.length === 0 && !loading && (
            <div style={{ color: '#666', fontStyle: 'italic' }}>Aucune offre trouvée</div>
          )}
        </div>

        {/* Applications List */}
        <div style={{ flex: 1 }}>
          <h4>
            Candidatures {selectedInternship && `- ${internships.find(i => i.id === selectedInternship)?.title}`}
          </h4>
          
          {loading && <div>Chargement des candidatures...</div>}
          
          {!selectedInternship ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
              Sélectionnez une offre pour voir les candidatures
            </div>
          ) : applications.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
              Aucune candidature pour cette offre
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map(app => (
                <div
                  key={app.id}
                  style={{
                    padding: 16,
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    background: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {app.first_name} {app.last_name}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px', marginTop: 4 }}>
                        {app.email} • {app.phone || 'Téléphone non fourni'}
                      </div>
                      {(app.matricule || app.speciality || app.academic_year) && (
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          {app.matricule && `Matricule: ${app.matricule}`}
                          {app.matricule && (app.speciality || app.academic_year) && ' • '}
                          {app.speciality && app.speciality}
                          {app.speciality && app.academic_year && ' - '}
                          {app.academic_year && `Année: ${app.academic_year}`}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        background: getStatusColor(app.status),
                        color: 'white',
                        borderRadius: 12,
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {app.status?.toUpperCase() || 'PENDING'}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 4 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Lettre de motivation:</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {getDisplayText(app)}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, fontSize: '12px', color: '#999' }}>
                    Postulé le: {new Date(app.created_at).toLocaleString('fr-FR')}
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        viewStudentProfile(app.student_id);
                        loadStudentDocuments(app.student_id);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        border: '1px solid #1976d2',
                        background: 'white',
                        color: '#1976d2',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      👁 Voir profil
                    </button>
                    <button
                      onClick={() => loadStudentDocuments(app.student_id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        border: '1px solid #4caf50',
                        background: showDocumentsFor === String(app.student_id) ? '#4caf50' : 'white',
                        color: showDocumentsFor === String(app.student_id) ? 'white' : '#4caf50',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      {showDocumentsFor === String(app.student_id) ? '📄 Masquer Documents' : '📄 Voir Documents'}
                    </button>

                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, 'approved')}
                          style={{
                            padding: '8px 16px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer'
                          }}
                        >
                          ✅ Approuver
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, 'rejected')}
                          style={{
                            padding: '8px 16px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Rejeter
                        </button>
                      </>
                    )}
                  </div>

                  {/* Documents section for this application */}
                  {showDocumentsFor === String(app.student_id) && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        background: '#f9f9f9'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h5 style={{ margin: 0 }}>Documents de {app.first_name} {app.last_name}</h5>
                        <button
                          onClick={() => setShowDocumentsFor(null)}
                          style={{
                            padding: '4px 8px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          ✕ Fermer
                        </button>
                      </div>
                      {documentsLoading[app.student_id] ? (
                        <div style={{ color: '#666' }}>Chargement des documents...</div>
                      ) : (studentDocuments[app.student_id] || []).length === 0 ? (
                        <div style={{ color: '#666' }}>Aucun document disponible</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(studentDocuments[app.student_id] || []).map(doc => (
                            <div
                              key={doc.id}
                              style={{
                                padding: 12,
                                background: 'white',
                                borderRadius: 4,
                                border: '1px solid #ddd',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 'bold' }}>
                                  {doc.document_type?.toUpperCase() || 'Document'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {doc.original_name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: 4 }}>
                                  Téléversé le: {new Date(doc.uploaded_at).toLocaleString('fr-FR')}
                                  {doc.is_verified && (
                                    <span style={{ color: '#4caf50', marginLeft: 8 }}>
                                      ✓ Vérifié
                                    </span>
                                  )}
                                </div>
                              </div>
                              {doc.file_path && (() => {
                                // Construct the file URL
                                const baseURL = authAPI.defaults.baseURL.replace('/api', '');
                                const filePath = doc.file_path.startsWith('/') ? doc.file_path : '/' + doc.file_path;
                                const fileUrl = `${baseURL}${filePath}`;
                                
                                // Check if path is invalid (absolute Windows path)
                                if (doc.file_path.includes(':\\') || doc.file_path.match(/^[A-Z]:/i)) {
                                  return (
                                    <span style={{ color: '#f44336', fontSize: '12px' }}>
                                      Chemin invalide
                                    </span>
                                  );
                                }
                                
                                return (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => {
                                      console.log('Opening document:', fileUrl);
                                      // Let the browser handle it normally
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      background: '#1976d2',
                                      color: 'white',
                                      textDecoration: 'none',
                                      borderRadius: 4,
                                      fontSize: '12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Voir
                                  </a>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Student profile detail panel */}
              {profileLoading && (
                <div style={{ marginTop: 16, color: '#666' }}>Chargement du profil étudiant...</div>
              )}
              {selectedStudentProfile && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #e0e0e0',
                    background: '#fafafa'
                  }}
                >
                  <h4>Profil de l'étudiant</h4>
                  <p>
                    <strong>Nom:</strong> {selectedStudentProfile.first_name}{' '}
                    {selectedStudentProfile.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedStudentProfile.email}
                  </p>
                  <p>
                    <strong>Téléphone:</strong> {selectedStudentProfile.phone || 'Non fourni'}
                  </p>
                  <p>
                    <strong>Spécialité:</strong> {selectedStudentProfile.speciality || '—'}
                  </p>
                  <p>
                    <strong>Année:</strong> {selectedStudentProfile.academic_year || selectedStudentProfile.year || '—'}
                  </p>
                  <p>
                    <strong>Matricule:</strong> {selectedStudentProfile.matricule || '—'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivedApplications;