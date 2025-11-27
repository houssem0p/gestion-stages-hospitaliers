import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import './InternshipDetail.css';
import authAPI from '../../../services/api';

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApplyPanel, setShowApplyPanel] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [newFileType, setNewFileType] = useState('other');

  useEffect(() => {
    let mounted = true;
    const fetchInternship = async () => {
      setLoading(true);
      try {
        const res = await authAPI.get(`/internships/${id}`);
        const data = res.data?.data || null;
        if (!data) {
          if (mounted) setInternship(null);
          return;
        }

        // Map backend fields to component fields and provide sensible defaults
        const mapped = {
          id: data.id,
          title: data.title || 'Untitled',
          hospital: data.hospital || 'Unknown Hospital',
          hospitalImage: data.hospitalImage || '/assets/hospitals/default.jpg',
          speciality: data.speciality || data.speciality || '',
          startDate: data.startDate || data.start_date || '',
          endDate: data.endDate || data.end_date || '',
          address: data.address || '',
          description: data.description || '',
          requirements: data.requirements || '',
          responsibilities: data.responsibilities || '',
          hospitalDescription: data.hospitalDescription || '',
          hospitalContact: data.hospitalContact || ''
        };

        if (mounted) setInternship(mapped);
      } catch (err) {
        console.error('Failed to fetch internship details', err);
        if (mounted) setInternship(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInternship();
    return () => { mounted = false; };
  }, [id]);

  const handleSave = () => {
    // TODO: Call backend to save internship
    setIsSaved(!isSaved);
  };

  const loadDocuments = async () => {
    try {
      const res = await authAPI.get('/students/documents');
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
      setDocuments([]);
    }
  };

  const handleApply = () => {
    const openPanel = async () => {
      await loadDocuments();
      setShowApplyPanel(true);
    };
    openPanel();
  };

  const handleUploadDoc = async () => {
    if (!newFile) return alert('Select a file first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', newFile);
      fd.append('document_type', newFileType);

      await authAPI.post('/students/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNewFile(null);
      setNewFileType('other');
      await loadDocuments();
      alert('Document uploaded');
    } catch (err) {
      console.error('Upload failed', err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submitApplication = async () => {
    try {
      setApplyLoading(true);
      const types = documents.map(d => d.document_type);
      const required = ['cv', 'transcripts'];
      const missing = required.filter(r => !types.includes(r));
      if (missing.length > 0) {
        const ok = window.confirm(
          `Vous devez d'abord téléverser: ${missing.join(', ')}. Aller à votre profil pour les ajouter ?`
        );
        if (ok) navigate('/profile');
        return;
      }

      if (!coverLetter.trim()) {
        alert('Veuillez saisir une lettre de motivation');
        return;
      }

      await authAPI.post(`/internships/${id}/apply`, { cover_letter: coverLetter.trim() });
      alert('Candidature envoyée avec succès.');
      setShowApplyPanel(false);
      setCoverLetter('');
    } catch (err) {
      console.error('Apply failed', err);
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyLoading(false);
    }
  };

  const goToHospital = () => {
    // TODO: Navigate to hospital detail page
    navigate(`/hospital/${internship.hospitalId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="page"><p>Loading...</p></div>
      </Layout>
    );
  }

  if (!internship) {
    return (
      <Layout>
        <div className="page"><p>Internship not found.</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="internship-detail-page">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        
        <div className="detail-header">
          <img src={internship.hospitalImage} alt={internship.hospital} className="detail-image" />
          <div className="detail-header-info">
            <h1>{internship.title}</h1>
            <p className="hospital-name">{internship.hospital}</p>
            <p className="speciality">{internship.speciality}</p>
            <p className="date-range">{internship.startDate} to {internship.endDate}</p>
            <p className="address">{internship.address}</p>
          </div>
        </div>

        <div className="detail-content">
          <div className="main-section">
            <section className="description-section">
              <h2>Description</h2>
              <p>{internship.description}</p>
            </section>

            <section className="requirements-section">
              <h2>Requirements</h2>
              <p>{internship.requirements}</p>
            </section>

            <section className="responsibilities-section">
              <h2>Responsibilities</h2>
              <p>{internship.responsibilities}</p>
            </section>
          </div>

          <div className="action-sidebar">
            <div className="action-buttons">
              <button
                onClick={handleSave}
                className={`save-btn ${isSaved ? 'saved' : ''}`}
              >
                {isSaved ? '♥ Saved' : '♡ Save'}
              </button>
              <button onClick={handleApply} className="apply-btn">
                Apply
              </button>
            </div>

            {showApplyPanel && (
              <div className="apply-panel">
                <h3>Confirmer votre candidature</h3>

                <div className="docs-section">
                  <h4>Vos documents</h4>
                  {documents.length === 0 ? (
                    <p>Aucun document trouvé. Vous devrez en ajouter (CV, relevés de notes).</p>
                  ) : (
                    <ul>
                      {documents.map(doc => (
                        <li key={doc.id}>
                          {doc.document_type} — {doc.original_name}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="upload-inline">
                    <select
                      value={newFileType}
                      onChange={e => setNewFileType(e.target.value)}
                    >
                      <option value="cv">CV</option>
                      <option value="transcripts">Relevés de notes</option>
                      <option value="school_certificate">Certificat de scolarité</option>
                      <option value="other">Autre</option>
                    </select>
                    <input type="file" onChange={e => setNewFile(e.target.files[0])} />
                    <button onClick={handleUploadDoc} disabled={uploading}>
                      {uploading ? 'Téléversement...' : 'Ajouter le document'}
                    </button>
                  </div>
                </div>

                <div className="cover-letter-section">
                  <h4>Lettre de motivation</h4>
                  <textarea
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    rows={5}
                    placeholder="Expliquez pourquoi vous postulez à ce stage..."
                  />
                </div>

                <div className="apply-actions">
                  <button onClick={submitApplication} disabled={applyLoading}>
                    {applyLoading ? 'Envoi...' : 'Envoyer la candidature'}
                  </button>
                  <button onClick={() => setShowApplyPanel(false)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="hospital-section">
              <h3>About Hospital</h3>
              <img src={internship.hospitalImage} alt={internship.hospital} className="hospital-image" />
              <p className="hospital-title">{internship.hospital}</p>
              <p className="hospital-description">{internship.hospitalDescription}</p>
              <p className="contact">Contact: {internship.hospitalContact}</p>
              <button onClick={goToHospital} className="hospital-detail-btn">
                Voir Profil de l'Hôpital
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InternshipDetail;
