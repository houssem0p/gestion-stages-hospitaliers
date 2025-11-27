import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import authAPI from '../../../services/api';
import './ManageEvaluationTemplates.css'; // Import the CSS

// currentInternshipId comes from ManageOffers when an offer is being edited
const ManageEvaluationTemplates = ({ currentInternshipId }) => {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    internship_id: '',
    template_name: '',
    description: '',
    criteria: []
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await authAPI.get('/evaluation-templates');
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    try {
      // Prefer internships for this hospital so templates are scoped correctly
      if (user?.hospital_id) {
        const res = await authAPI.get(`/hospitals/${user.hospital_id}/internships`);
        setInternships(res.data.data || []);
      } else {
        const res = await authAPI.get('/internships');
        setInternships(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load internships', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchInternships();
  }, []);

  // If an offer is currently being edited in ManageOffers, pre-select it here
  useEffect(() => {
    if (currentInternshipId && !form.internship_id) {
      setForm(prev => ({ ...prev, internship_id: String(currentInternshipId) }));
    }
  }, [currentInternshipId]);

  const addCriteria = () => {
    setForm({
      ...form,
      criteria: [
        ...form.criteria,
        { category: '', criteria_text: '', criteria_type: 'scale', weight: 1.0, max_score: 5 }
      ]
    });
  };

  const removeCriteria = (index) => {
    const updatedCriteria = form.criteria.filter((_, i) => i !== index);
    setForm({ ...form, criteria: updatedCriteria });
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);
      if (!form.template_name || !form.internship_id) {
        return alert('Template name and internship must be selected');
      }

      const payload = {
        internship_id: parseInt(form.internship_id, 10),
        template_name: form.template_name,
        description: form.description,
        created_by: user?.id || null,
        criteria: form.criteria
      };

      if (editing) {
        await authAPI.put(`/evaluation-templates/${editing}`, payload);
      } else {
        await authAPI.post('/evaluation-templates', payload);
      }
      await fetchTemplates();
      setForm({ internship_id: '', template_name: '', description: '', criteria: [] });
      setEditing(null);
      alert(editing ? 'Template updated successfully' : 'Template created successfully');
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (template) => {
    setEditing(template.id);
    setForm({
      internship_id: template.internship_id || '',
      template_name: template.template_name,
      description: template.description,
      criteria: template.criteria || []
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ internship_id: '', template_name: '', description: '', criteria: [] });
  };

  return (
    <div className="manage-evaluation-templates">
      <h2>Manage Evaluation Templates</h2>

      <div className="templates-list">
        <h3>Existing Templates</h3>
        {loading && <div className="loading">Loading templates...</div>}
        
        {templates.length === 0 && !loading && (
          <div className="no-templates">
            No evaluation templates found. Create your first template!
          </div>
        )}
        
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h4>{template.template_name}</h4>
              <span className="template-status status-active">Active</span>
            </div>
            <p>{template.description}</p>
            <div className="template-actions">
              <button 
                onClick={() => startEdit(template)}
                className="btn btn-primary btn-small"
              >
                Edit Template
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="template-form">
        <h3>{editing ? 'Edit Template' : 'Create New Template'}</h3>
        
        <div className="form-group">
          <label className="text-required">Internship</label>
          <select
            value={form.internship_id}
            onChange={(e) => setForm({ ...form, internship_id: e.target.value })}
          >
            <option value="">Select internship</option>
            {internships.map(i => (
              <option key={i.id} value={i.id}>
                {i.title} - {i.hospital || ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="text-required">Template Name</label>
          <input
            type="text"
            value={form.template_name}
            onChange={(e) => setForm({ ...form, template_name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the purpose of this evaluation template"
            rows="3"
          />
        </div>

        <div className="criteria-section">
          <h4>Evaluation Criteria</h4>
          <p className="criteria-description">
            Define the criteria that supervisors will use to evaluate interns.
          </p>
          
          {form.criteria.map((criterion, index) => (
            <div key={index} className="criteria-item">
              <div className="criteria-header">
                <div className="criteria-number">{index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeCriteria(index)}
                  className="btn btn-danger btn-small"
                >
                  Remove
                </button>
              </div>
              
              <div className="criteria-fields">
                <div className="criteria-field-full">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Clinical Skills, Professionalism"
                    value={criterion.category}
                    onChange={(e) => {
                      const updatedCriteria = [...form.criteria];
                      updatedCriteria[index].category = e.target.value;
                      setForm({ ...form, criteria: updatedCriteria });
                    }}
                  />
                </div>
                
                <div className="criteria-field-full">
                  <label>Criteria Text</label>
                  <input
                    type="text"
                    placeholder="e.g., Demonstrates proficiency in surgical techniques"
                    value={criterion.criteria_text}
                    onChange={(e) => {
                      const updatedCriteria = [...form.criteria];
                      updatedCriteria[index].criteria_text = e.target.value;
                      setForm({ ...form, criteria: updatedCriteria });
                    }}
                  />
                </div>
                
                <div className="criteria-field-half">
                  <label>Criteria Type</label>
                  <select
                    value={criterion.criteria_type}
                    onChange={(e) => {
                      const updatedCriteria = [...form.criteria];
                      updatedCriteria[index].criteria_type = e.target.value;
                      setForm({ ...form, criteria: updatedCriteria });
                    }}
                  >
                    <option value="scale">Scale (1-5)</option>
                    <option value="yes_no">Yes/No</option>
                    <option value="text">Text Feedback</option>
                  </select>
                </div>
                
                <div className="criteria-field-half">
                  <label>Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="1.0"
                    value={criterion.weight}
                    onChange={(e) => {
                      const updatedCriteria = [...form.criteria];
                      updatedCriteria[index].weight = parseFloat(e.target.value);
                      setForm({ ...form, criteria: updatedCriteria });
                    }}
                  />
                </div>
                
                {criterion.criteria_type === 'scale' && (
                  <div className="criteria-field-half">
                    <label>Max Score</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="5"
                      value={criterion.max_score}
                      onChange={(e) => {
                        const updatedCriteria = [...form.criteria];
                        updatedCriteria[index].max_score = parseInt(e.target.value, 10);
                        setForm({ ...form, criteria: updatedCriteria });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <button 
            onClick={addCriteria}
            className="btn btn-secondary"
            type="button"
          >
            + Add Criterion
          </button>
        </div>

        <div className="form-actions">
          <button 
            onClick={saveTemplate}
            disabled={loading || !form.template_name || !form.internship_id}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (editing ? 'Update Template' : 'Create Template')}
          </button>
          
          {editing && (
            <button 
              onClick={cancelEdit}
              className="btn btn-secondary"
              type="button"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvaluationTemplates;