import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import authAPI from '../../../services/api';

const ManageEvaluationTemplates = () => {
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
      const res = await authAPI.get('/internships');
      setInternships(res.data.data || []);
    } catch (err) {
      console.error('Failed to load internships', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchInternships();
  }, []);

  const addCriteria = () => {
    setForm({
      ...form,
      criteria: [
        ...form.criteria,
        { category: '', criteria_text: '', criteria_type: 'scale', weight: 1.0, max_score: 5 }
      ]
    });
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);
      // validation
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
    setForm({ template_name: '', description: '', criteria: [] });
  };

  return (
    <div className="page manage-evaluation-templates">
      <h2>Manage Evaluation Templates</h2>

      <div className="templates-list">
        <h3>Existing Templates</h3>
        {loading && <div>Loading...</div>}
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <h4>{template.template_name}</h4>
            <p>{template.description}</p>
            <button onClick={() => startEdit(template)}>Edit</button>
          </div>
        ))}
      </div>

      <div className="template-form">
        <h3>{editing ? 'Edit Template' : 'Create New Template'}</h3>
        <div>
          <label>Internship *</label>
          <select
            value={form.internship_id}
            onChange={(e) => setForm({ ...form, internship_id: e.target.value })}
          >
            <option value="">Select internship</option>
            {internships.map(i => (
              <option key={i.id} value={i.id}>{i.title} - {i.hospital || ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Template Name</label>
          <input
            type="text"
            value={form.template_name}
            onChange={(e) => setForm({ ...form, template_name: e.target.value })}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <h4>Criteria</h4>
          {form.criteria.map((criterion, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Category"
                value={criterion.category}
                onChange={(e) => {
                  const updatedCriteria = [...form.criteria];
                  updatedCriteria[index].category = e.target.value;
                  setForm({ ...form, criteria: updatedCriteria });
                }}
              />
              <input
                type="text"
                placeholder="Criteria Text"
                value={criterion.criteria_text}
                onChange={(e) => {
                  const updatedCriteria = [...form.criteria];
                  updatedCriteria[index].criteria_text = e.target.value;
                  setForm({ ...form, criteria: updatedCriteria });
                }}
              />
              <select
                value={criterion.criteria_type}
                onChange={(e) => {
                  const updatedCriteria = [...form.criteria];
                  updatedCriteria[index].criteria_type = e.target.value;
                  setForm({ ...form, criteria: updatedCriteria });
                }}
              >
                <option value="scale">Scale</option>
                <option value="yes_no">Yes/No</option>
                <option value="text">Text</option>
              </select>
              <input
                type="number"
                placeholder="Weight"
                value={criterion.weight}
                onChange={(e) => {
                  const updatedCriteria = [...form.criteria];
                  updatedCriteria[index].weight = parseFloat(e.target.value);
                  setForm({ ...form, criteria: updatedCriteria });
                }}
              />
              <input
                type="number"
                placeholder="Max Score"
                value={criterion.max_score}
                onChange={(e) => {
                  const updatedCriteria = [...form.criteria];
                  updatedCriteria[index].max_score = parseInt(e.target.value, 10);
                  setForm({ ...form, criteria: updatedCriteria });
                }}
              />
            </div>
          ))}
          <button onClick={addCriteria}>+ Add Criterion</button>
        </div>
        <button onClick={saveTemplate}>{editing ? 'Update Template' : 'Create Template'}</button>
        {editing && <button onClick={cancelEdit}>Cancel</button>}
      </div>
    </div>
  );
};

export default ManageEvaluationTemplates;