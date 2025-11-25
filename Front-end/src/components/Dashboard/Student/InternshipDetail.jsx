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

  const handleApply = () => {
    // Check student documents and call backend apply endpoint
    const doApply = async () => {
      try {
        // fetch uploaded documents
        const res = await authAPI.get('/students/documents');
        const docs = res.data.data || [];
        const types = docs.map(d => d.document_type);
        const required = ['cv', 'transcripts'];
        const missing = required.filter(r => !types.includes(r));
        if (missing.length > 0) {
          const ok = window.confirm(`You must upload the following documents before applying: ${missing.join(', ')}. Go to your profile to upload them?`);
          if (ok) navigate('/profile');
          return;
        }

        // submit application
        await authAPI.post(`/internships/${id}/apply`, { cover_letter: '' });
        alert('Application submitted successfully.');
      } catch (err) {
        console.error('Apply failed', err);
        alert(err.response?.data?.message || 'Failed to apply');
      }
    };

    doApply();
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
