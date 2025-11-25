import React, { useEffect, useState } from 'react';
// router removed to avoid nested Router error; routing is handled at app root
import authAPI from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import ManageEvaluationTemplates from './ManageEvaluationTemplates';

const emptyForm = { 
  title: '', 
  description: '', 
  speciality: '', 
  doctor_id: '', 
  startDate: '', 
  endDate: '', 
  address: '', 
  requirements: '' 
};

const ManageOffers = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const hospitalId = user?.hospital_id;

  const fetchInternships = async () => {
    if (!hospitalId) return;
    try {
      setLoading(true);
      const res = await authAPI.get(`/hospitals/${hospitalId}/internships`);
      setInternships(res.data.data || []);
    } catch (err) {
      console.error('Failed to load internships', err);
    } finally { 
      setLoading(false); 
    }
  };

  const fetchDoctors = async () => {
    if (!hospitalId) return;
    try {
      const res = await authAPI.get(`/hospitals/${hospitalId}/doctors`);
      console.debug('Loaded doctors for hospital', hospitalId, res.data);
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  useEffect(() => { 
    fetchInternships();
    fetchDoctors();
  }, [hospitalId]);

  const startCreate = () => { 
    setEditing(null); 
    setForm(emptyForm); 
  };

  const startEdit = (internship) => { 
    setEditing(internship.id); 
    setForm({ 
      title: internship.title, 
      description: internship.description || '', 
      speciality: internship.speciality, 
      doctor_id: internship.doctor_id || '', 
      startDate: internship.startDate ? internship.startDate.split('T')[0] : '', 
      endDate: internship.endDate ? internship.endDate.split('T')[0] : '', 
      address: internship.address || '', 
      requirements: internship.requirements || '' 
    }); 
  };

  const save = async () => {
    if (!hospitalId) return alert('Hospital id missing');
    
    // Validation
    if (!form.title || !form.speciality) {
      return alert('Title and speciality are required');
    }

    try {
      setLoading(true);
      if (editing) {
        // Update existing internship
        await authAPI.put(`/internships/${editing}`, form);
      } else {
        // Create new internship
        await authAPI.post(`/hospitals/${hospitalId}/internships`, form);
      }
      await fetchInternships();
      setEditing(null);
      setForm(emptyForm);
      alert(editing ? 'Offer updated successfully' : 'Offer created successfully');
    } catch (err) {
      console.error('Save failed', err);
      alert(err.response?.data?.message || 'Save failed');
    } finally { 
      setLoading(false); 
    }
  };

  const archive = async (id) => {
    if (!confirm('Are you sure you want to archive this offer?')) return;
    try {
      await authAPI.put(`/internships/${id}/archive`);
      await fetchInternships();
      alert('Offer archived successfully');
    } catch (err) { 
      console.error(err); 
      alert('Archive failed'); 
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  return (
      <div className="page manage-offers">
        <h2>Manage Internship Offers — Create / Edit / Archive</h2>
        
        {!hospitalId && (
          <div className="error-message">
            Your account is not associated with a hospital. Cannot manage offers.
          </div>
        )}

        <div className="manage-layout">
          {/* Left Panel - Offers List */}
          <div className="manage-left">
            <div className="section-header">
              <h3>Existing Offers</h3>
              <button 
                onClick={startCreate} 
                className="btn btn-primary"
                disabled={!hospitalId}
              >
                + Create New Offer
              </button>
            </div>

            {loading && <div className="loading">Loading offers...</div>}

            <div className="offers-list">
              {internships.map(internship => (
                <div key={internship.id} className="offer-card">
                  <div className="offer-header">
                    <h4 className="offer-title">{internship.title}</h4>
                    <span className="offer-speciality">{internship.speciality}</span>
                  </div>
                  <div className="offer-details">
                    <p className="offer-desc">{internship.description}</p>
                    <div className="offer-meta">
                      {internship.startDate && (
                        <span>Start: {new Date(internship.startDate).toLocaleDateString()}</span>
                      )}
                      {internship.endDate && (
                        <span>End: {new Date(internship.endDate).toLocaleDateString()}</span>
                      )}
                      {internship.hospital && (
                        <span>Hospital: {internship.hospital}</span>
                      )}
                    </div>
                  </div>
                  <div className="offer-actions">
                    <button 
                      onClick={() => startEdit(internship)} 
                      className="btn btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => archive(internship.id)} 
                      className="btn btn-danger"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
              
              {internships.length === 0 && !loading && (
                <div className="no-offers">
                  No internship offers found. Create your first offer!
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="manage-right">
            <div className="form-section">
              <h3>{editing ? 'Edit Offer' : 'Create New Offer'}</h3>
              
              <div className="offer-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input 
                    type="text" 
                    placeholder="Internship title"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    disabled={!hospitalId}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="Detailed description of the internship"
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    disabled={!hospitalId}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Speciality *</label>
                  <input 
                    type="text" 
                    placeholder="Medical speciality"
                    value={form.speciality}
                    onChange={e => setForm({...form, speciality: e.target.value})}
                    disabled={!hospitalId}
                  />
                </div>

                <div className="form-group">
                  <label>Supervising Doctor</label>
                  <select 
                    value={form.doctor_id}
                    onChange={e => setForm({...form, doctor_id: e.target.value})}
                    disabled={!hospitalId}
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.first_name} {doctor.last_name} 
                        {doctor.medical_specialty && ` (${doctor.medical_specialty})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      value={form.startDate}
                      onChange={e => setForm({...form, startDate: e.target.value})}
                      disabled={!hospitalId}
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      value={form.endDate}
                      onChange={e => setForm({...form, endDate: e.target.value})}
                      disabled={!hospitalId}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    placeholder="Hospital address"
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    disabled={!hospitalId}
                  />
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <textarea 
                    placeholder="Specific requirements for applicants"
                    value={form.requirements}
                    onChange={e => setForm({...form, requirements: e.target.value})}
                    disabled={!hospitalId}
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    onClick={save} 
                    disabled={loading || !hospitalId || !form.title || !form.speciality}
                    className="btn btn-primary"
                  >
                    {loading ? 'Saving...' : (editing ? 'Update Offer' : 'Create Offer')}
                  </button>
                  
                  {editing && (
                    <button 
                      onClick={cancelEdit}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Placeholder for ManageEvaluationTemplates component */}
            <div className="evaluation-templates-section">
              <ManageEvaluationTemplates />
            </div>
          </div>
        </div>
      </div>
  );
};

export default ManageOffers;