import React, { useEffect, useState } from 'react';
import authAPI from '../../../services/api';
import './ManageOffers.css';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const res = await authAPI.get('/hospitals');
        setHospitals(res.data.data || []);
      } catch (err) {
        console.error('Failed to load hospitals', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const loadInternships = async (hospital) => {
    setSelected(hospital);
    setInternships([]);
    try {
      setLoading(true);
      const res = await authAPI.get(`/hospitals/${hospital.id}/internships`);
      setInternships(res.data.data || []);
    } catch (err) {
      console.error('Failed to load internships', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page hospital-page">
      <h2>Hospitals</h2>
      {loading && <p>Loading...</p>}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>All hospitals</h3>
          <ul>
            {hospitals.map((h) => (
              <li key={h.id} style={{ marginBottom: 8 }}>
                <button onClick={() => loadInternships(h)} style={{ cursor: 'pointer' }}>
                  {h.name} — {h.wilaya || h.address}
                </button>
              </li>
            ))}
            {hospitals.length === 0 && !loading && <li>No hospitals found.</li>}
          </ul>
        </div>

        <div style={{ flex: 2 }}>
          <h3>Internships {selected ? `— ${selected.name}` : ''}</h3>
          {internships.length === 0 && !loading && <p>No internships to show.</p>}
          <ul>
            {internships.map((it) => (
              <li key={it.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <strong>{it.title}</strong>
                <div>{it.description}</div>
                <div>Specialty: {it.specialty || '—'}</div>
                <div>Duration: {it.duration || '—'}</div>
                <div>Slots: {it.available_slots ?? '—'}</div>
                <div>Status: {it.status || '—'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
