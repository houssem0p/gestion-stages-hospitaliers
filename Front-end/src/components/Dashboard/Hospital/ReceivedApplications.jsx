import React, { useEffect, useState } from 'react';
import authAPI from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const ReceivedApplications = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

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
                <div key={app.id} style={{ 
                  padding: 16, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 8,
                  background: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {app.first_name} {app.last_name}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px', marginTop: 4 }}>
                        {app.email} • {app.phone || 'Téléphone non fourni'}
                      </div>
                      {app.matricule && (
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          Matricule: {app.matricule} • {app.speciality} - {app.year}
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: getStatusColor(app.status),
                      color: 'white',
                      borderRadius: 12,
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
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

                  {app.status === 'pending' && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivedApplications;