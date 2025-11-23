import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import './InternshipDetail.css';

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch internship details from backend using id
    // For now, mock data
    const mockData = {
      id: id,
      title: 'Internship in Cardiology',
      hospital: 'General Hospital',
      hospitalImage: '/assets/hospital1.jpg',
      speciality: 'Cardiology',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      address: '123 Medical Street, Cairo, Egypt',
      description: 'This is a comprehensive internship program in cardiology. You will learn about cardiac care, patient management, diagnostic procedures, and medical treatment strategies.',
      requirements: 'Bachelor\'s degree in Medicine or related field',
      responsibilities: 'Patient care, diagnostics, documentation, team collaboration',
      hospitalDescription: 'General Hospital is one of the leading medical institutions in Egypt, providing world-class healthcare services.',
      hospitalContact: '+20-100-123-4567'
    };
    setTimeout(() => {
      setInternship(mockData);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSave = () => {
    // TODO: Call backend to save internship
    setIsSaved(!isSaved);
  };

  const handleApply = () => {
    // TODO: Call backend to apply for internship
    alert('Application submitted! (Mock)');
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
