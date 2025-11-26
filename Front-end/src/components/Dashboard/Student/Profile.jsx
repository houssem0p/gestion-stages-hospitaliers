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
  const [saving, setSaving] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await authAPI.get('/students/documents');
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await authAPI.get('/students/profile');
      if (res.data.success && res.data.data) {
        const profileData = res.data.data;
        setForm(prev => ({
          first_name: profileData.first_name || prev.first_name || user?.first_name || '',
          last_name: profileData.last_name || prev.last_name || user?.last_name || '',
          matricule: profileData.matricule || prev.matricule || '',
          speciality: profileData.speciality || prev.speciality || '',
          year: profileData.academic_year || prev.year || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save to student_profiles table
      await authAPI.post('/students/profile', {
        first_name: form.first_name,
        last_name: form.last_name,
        matricule: form.matricule,
        speciality: form.speciality,
        academic_year: form.year
      });

      // Update local user context with first_name and last_name
      const updated = { ...user, first_name: form.first_name, last_name: form.last_name };
      updateUser(updated);

      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to save profile', err);
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
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
