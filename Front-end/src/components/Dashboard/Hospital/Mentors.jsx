import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import authAPI from '../../../services/api';
import './Mentors.css';

const Mentors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeAssignments: 0,
    availableDoctors: 0,
    specialties: 0
  });

  const hospitalId = user?.hospital_id;

  // Fetch doctors for the hospital
  const fetchDoctors = async () => {
    if (!hospitalId) return;
    
    setLoading(true);
    try {
      const response = await authAPI.get(`/hospitals/${hospitalId}/doctors`);
      if (response.data.success) {
        setDoctors(response.data.data || []);
        updateStats(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Failed to load doctors: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch internships for the hospital
  const fetchInternships = async () => {
    if (!hospitalId) return;
    
    try {
      const response = await authAPI.get(`/hospitals/${hospitalId}/internships`);
      if (response.data.success) {
        // Get all internships (both with and without assigned doctors)
        setInternships(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    }
  };

  // Update statistics
  const updateStats = (doctorsList) => {
    const specialties = new Set(doctorsList.map(doc => doc.medical_specialty || doc.specialty).filter(Boolean));
    const assignedDoctors = doctorsList.filter(doc => 
      internships.some(internship => internship.doctor_id === doc.id)
    ).length;

    setStats({
      totalDoctors: doctorsList.length,
      activeAssignments: assignedDoctors,
      availableDoctors: doctorsList.length - assignedDoctors,
      specialties: specialties.size
    });
  };

  // Assign doctor to internship
  const assignToInternship = async () => {
    if (!selectedDoctor || !selectedInternship) {
      alert('Please select both a doctor and an internship');
      return;
    }

    setAssigning(true);
    try {
      const response = await authAPI.put(`/internships/${selectedInternship}`, {
        doctor_id: selectedDoctor.id
      });

      if (response.data.success) {
        alert('Doctor assigned successfully!');
        setSelectedInternship('');
        fetchInternships(); // Refresh internships list
        fetchDoctors(); // Refresh doctors list to update assignments
      }
    } catch (error) {
      console.error('Error assigning doctor:', error);
      alert('Failed to assign doctor: ' + (error.response?.data?.message || error.message));
    } finally {
      setAssigning(false);
    }
  };

  // Remove doctor from internship
  const removeAssignment = async (internshipId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      const response = await authAPI.put(`/internships/${internshipId}`, {
        doctor_id: null
      });

      if (response.data.success) {
        alert('Assignment removed successfully!');
        fetchInternships();
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      alert('Failed to remove assignment: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchDoctors();
      fetchInternships();
    }
  }, [hospitalId]);

  useEffect(() => {
    if (doctors.length > 0 && internships.length > 0) {
      updateStats(doctors);
    }
  }, [doctors, internships]);

  // Get internships assigned to selected doctor
  const getDoctorAssignments = (doctorId) => {
    return internships.filter(internship => internship.doctor_id === doctorId);
  };

  // Get all assigned internships
  const getAssignedInternships = () => {
    return internships.filter(internship => internship.doctor_id);
  };

  return (
    <div className="mentors-page">
      <div className="mentors-header">
        <h2>👨‍⚕️ Encadrants (Médecins Superviseurs)</h2>
        <p>Gérez et assignez les médecins superviseurs aux stages</p>
      </div>

      {!hospitalId && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ffeaea, #ffcccc)', 
          color: '#d63031', 
          padding: '16px', 
          borderRadius: '8px',
          borderLeft: '4px solid #d63031',
          marginBottom: '24px',
          fontWeight: '500'
        }}>
          ⚠️ Votre compte n'est pas rattaché à un hôpital.
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalDoctors}</div>
          <div className="stat-label">Médecins Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeAssignments}</div>
          <div className="stat-label">Assignés Actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.availableDoctors}</div>
          <div className="stat-label">Disponibles</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.specialties}</div>
          <div className="stat-label">Spécialités</div>
        </div>
      </div>

      <div className="mentors-layout">
        {/* Main Content - Doctors List */}
        <div className="mentors-main">
          <div className="doctors-header">
            <h3>
              Liste des Médecins
              <span className="doctor-count">{doctors.length}</span>
            </h3>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              Chargement des médecins...
            </div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍⚕️</div>
              <h4>Aucun médecin trouvé</h4>
              <p>Aucun médecin n'est actuellement rattaché à votre hôpital.</p>
            </div>
          ) : (
            <div className="doctors-list">
              {doctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`doctor-item ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="doctor-info">
                    <div className="doctor-details">
                      <h4>Dr. {doctor.first_name} {doctor.last_name}</h4>
                      <div className="doctor-contact">
                        📧 {doctor.email}
                      </div>
                      {(doctor.medical_specialty || doctor.specialty) && (
                        <span className="doctor-specialty">
                          🎯 {doctor.medical_specialty || doctor.specialty}
                        </span>
                      )}
                      {doctor.years_of_experience && (
                        <div className="doctor-experience">
                          ⏳ {doctor.years_of_experience} ans d'expérience
                        </div>
                      )}
                    </div>
                    <div className="doctor-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoctor(doctor);
                        }}
                      >
                        📋 Assigner
                      </button>
                    </div>
                  </div>

                  {/* Current Assignments */}
                  {getDoctorAssignments(doctor.id).length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                      <strong>Stage(s) assigné(s):</strong>
                      {getDoctorAssignments(doctor.id).map(internship => (
                        <div key={internship.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginTop: '8px',
                          padding: '8px',
                          background: 'white',
                          borderRadius: '4px'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{internship.title}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {internship.speciality} • {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'Date non définie'}
                            </div>
                          </div>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAssignment(internship.id);
                            }}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Assignment & Info */}
        <div className="mentors-sidebar">
          {/* Assignment Section */}
          <div className="sidebar-section">
            <h4>📋 Assigner un Stage</h4>
            <div className="form-group">
              <label>Médecin Sélectionné</label>
              <input
                type="text"
                className="form-control"
                value={selectedDoctor ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` : 'Aucun médecin sélectionné'}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Stage à Assigner</label>
              <select
                className="form-control"
                value={selectedInternship}
                onChange={(e) => setSelectedInternship(e.target.value)}
                disabled={!selectedDoctor || internships.filter(i => !i.doctor_id).length === 0}
              >
                <option value="">Sélectionnez un stage</option>
                {internships
                  .filter(internship => !internship.doctor_id)
                  .map(internship => (
                    <option key={internship.id} value={internship.id}>
                      {internship.title} ({internship.speciality})
                    </option>
                  ))
                }
              </select>
              {internships.filter(i => !i.doctor_id).length === 0 && (
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                  Aucun stage disponible pour assignation
                </small>
              )}
            </div>

            <button
              className="btn btn-success btn-full"
              onClick={assignToInternship}
              disabled={!selectedDoctor || !selectedInternship || assigning}
            >
              {assigning ? '⏳ Assignation...' : '✅ Assigner le Stage'}
            </button>
          </div>

          {/* Current Assignments */}
          {getAssignedInternships().length > 0 && (
            <div className="assignment-section">
              <h5>🎯 Assignations Actives</h5>
              <div className="current-assignments">
                {getAssignedInternships().map(internship => {
                  const assignedDoctor = doctors.find(d => d.id === internship.doctor_id);
                  return (
                    <div key={internship.id} className="assignment-item">
                      <div className="assignment-info">
                        <h6>{internship.title}</h6>
                        <span>
                          👨‍⚕️ Dr. {assignedDoctor?.first_name} {assignedDoctor?.last_name}
                        </span>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeAssignment(internship.id)}
                        title="Retirer l'assignation"
                      >
                        ❌
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h4>⚡ Actions Rapides</h4>
            <button
              className="btn btn-primary btn-full"
              onClick={fetchDoctors}
              style={{ marginBottom: '8px' }}
            >
              🔄 Actualiser la Liste
            </button>
            <button
              className="btn btn-outline btn-full"
              onClick={() => {
                setSelectedDoctor(null);
                setSelectedInternship('');
              }}
            >
              🧹 Effacer la Sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentors;
