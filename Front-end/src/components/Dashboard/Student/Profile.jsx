import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import authAPI from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    matricule: user?.matricule || '',
    speciality: user?.speciality || '',
    year: user?.year || ''
  });

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('cv');

  const fetchDocuments = async () => {
    try {
      const res = await authAPI.get('/students/documents');
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // No backend endpoint for student profile in current API; persist locally in auth context
    const updated = { ...user, ...form };
    updateUser(updated);
    alert('Profile saved locally.');
  };

  const handleSelectFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Select a file first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('document_type', docType);

      await authAPI.post('/students/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFile(null);
      setDocType('cv');
      await fetchDocuments();
      alert('Document uploaded');
    } catch (err) {
      console.error('Upload failed', err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="page profile-page">
        <h2>Mon Profil</h2>
        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className="form-row">
            <label>Prénom</label>
            <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
            <label>Nom</label>
            <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
          </div>
          <div className="form-row">
            <label>Matricule</label>
            <input value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} />
            <label>Spécialité</label>
            <input value={form.speciality} onChange={e => setForm({...form, speciality: e.target.value})} />
          </div>
          <div className="form-row">
            <label>Année</label>
            <input value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </div>
        </form>

        <section className="documents-section">
          <h3>Documents</h3>
          <div className="upload-row">
            <select value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="cv">CV</option>
              <option value="transcripts">Transcripts</option>
              <option value="school_certificate">School Certificate</option>
              <option value="other">Other</option>
            </select>
            <input type="file" onChange={handleSelectFile} />
            <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>

          <div className="documents-list">
            {documents.length === 0 && <div>No documents uploaded yet.</div>}
            {documents.map(doc => (
              <div key={doc.id} className="doc-item">
                <strong>{doc.document_type}</strong> — {doc.original_name} • {new Date(doc.uploaded_at).toLocaleString()}
                {doc.file_path && (
                  <a className="btn-link" href={authAPI.defaults.baseURL.replace('/api','') + doc.file_path} target="_blank" rel="noreferrer">View</a>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Profile;
