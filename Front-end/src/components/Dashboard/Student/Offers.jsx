import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import './Offers.css';

const Offers = () => {
  const [allInternships, setAllInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    speciality: '',
    hospital: '',
    startDate: '',
    search: ''
  });
  const [savedInternships, setSavedInternships] = useState([]);

  // Mock data - replace with API call
  const mockInternships = [
    {
      id: 1,
      title: 'Cardiology Internship',
      hospital: 'General Hospital',
      hospitalImage: '/assets/hospital1.jpg',
      speciality: 'Cardiology',
      startDate: '2024-01-15',
      address: 'Cairo, Egypt',
      description: 'Learn about cardiac care and patient management.'
    },
    {
      id: 2,
      title: 'Neurology Internship',
      hospital: 'Saint Johns Hospital',
      hospitalImage: '/assets/hospital2.jpg',
      speciality: 'Neurology',
      startDate: '2024-02-01',
      address: 'Alexandria, Egypt',
      description: 'Explore neurological disorders and treatments.'
    },
    {
      id: 3,
      title: 'Pediatrics Internship',
      hospital: 'Children\'s Medical Center',
      hospitalImage: '/assets/hospital3.jpg',
      speciality: 'Pediatrics',
      startDate: '2024-01-20',
      address: 'Giza, Egypt',
      description: 'Work with pediatric patients and develop clinical skills.'
    },
    {
      id: 4,
      title: 'Surgery Internship',
      hospital: 'Trauma Center',
      hospitalImage: '/assets/hospital4.jpg',
      speciality: 'Surgery',
      startDate: '2024-03-01',
      address: 'Cairo, Egypt',
      description: 'Gain surgical experience in emergency and elective cases.'
    },
    {
      id: 5,
      title: 'Oncology Internship',
      hospital: 'Cancer Research Institute',
      hospitalImage: '/assets/hospital5.jpg',
      speciality: 'Oncology',
      startDate: '2024-02-15',
      address: 'Helwan, Egypt',
      description: 'Learn about cancer treatment and patient care.'
    },
    {
      id: 6,
      title: 'Emergency Medicine',
      hospital: 'General Hospital',
      hospitalImage: '/assets/hospital1.jpg',
      speciality: 'Emergency Medicine',
      startDate: '2024-01-25',
      address: 'Cairo, Egypt',
      description: 'Handle emergency cases and acute patient situations.'
    }
  ];

  useEffect(() => {
    // TODO: Replace with API call to fetch internships from backend
    setTimeout(() => {
      setAllInternships(mockInternships);
      setFilteredInternships(mockInternships);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Apply filters whenever filter state changes
    let result = allInternships;

    if (filters.speciality) {
      result = result.filter(i => i.speciality.toLowerCase() === filters.speciality.toLowerCase());
    }
    if (filters.hospital) {
      result = result.filter(i => i.hospital.toLowerCase().includes(filters.hospital.toLowerCase()));
    }
    if (filters.startDate) {
      result = result.filter(i => new Date(i.startDate) >= new Date(filters.startDate));
    }
    if (filters.search) {
      result = result.filter(i =>
        i.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        i.hospital.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredInternships(result);
  }, [filters, allInternships]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSave = (id) => {
    setSavedInternships(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    // TODO: Call backend to save/unsave internship
  };

  const uniqueSpecialities = [...new Set(allInternships.map(i => i.speciality))];
  const uniqueHospitals = [...new Set(allInternships.map(i => i.hospital))];

  if (loading) {
    return (
      <Layout>
        <div className="page"><p>Loading internships...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="offers-page">
        <h1>Offres de Stages</h1>
        
        <div className="offers-container">
        {/* Left Sidebar - Filters */}
        <aside className="filters-sidebar">
          <h3>Filtres</h3>
          
          <div className="filter-group">
            <label htmlFor="search">Recherche</label>
            <input
              id="search"
              type="text"
              name="search"
              placeholder="Titre ou hôpital..."
              value={filters.search}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="speciality">Spécialité</label>
            <select
              id="speciality"
              name="speciality"
              value={filters.speciality}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Toutes les spécialités</option>
              {uniqueSpecialities.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="hospital">Hôpital</label>
            <select
              id="hospital"
              name="hospital"
              value={filters.hospital}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Tous les hôpitaux</option>
              {uniqueHospitals.map(hosp => (
                <option key={hosp} value={hosp}>{hosp}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Date de Début (à partir de)</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <button
            onClick={() => setFilters({ speciality: '', hospital: '', startDate: '', search: '' })}
            className="reset-filters-btn"
          >
            Réinitialiser les filtres
          </button>
        </aside>

        {/* Right Content - Internship Cards */}
        <div className="offers-content">
          <div className="results-header">
            <p className="results-count">{filteredInternships.length} résultat(s) trouvé(s)</p>
          </div>

          {filteredInternships.length === 0 ? (
            <div className="no-results">
              <p>Aucun stage ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="internships-grid">
              {filteredInternships.map(internship => (
                <div key={internship.id} className="internship-card">
                  <Link to={`/internships/${internship.id}`} className="card-link">
                    <div className="card-image">
                      <img src={internship.hospitalImage} alt={internship.hospital} />
                    </div>
                    <div className="card-info">
                      <h3 className="card-title">{internship.title}</h3>
                      <p className="card-hospital">{internship.hospital}</p>
                      <p className="card-speciality">{internship.speciality}</p>
                      <p className="card-date">📅 {internship.startDate}</p>
                      <p className="card-address">📍 {internship.address}</p>
                      <p className="card-description">{internship.description}</p>
                    </div>
                  </Link>
                  <div className="card-actions">
                    <button
                      onClick={() => toggleSave(internship.id)}
                      className={`save-btn ${savedInternships.includes(internship.id) ? 'saved' : ''}`}
                      title={savedInternships.includes(internship.id) ? 'Unsave' : 'Save'}
                    >
                      {savedInternships.includes(internship.id) ? '♥' : '♡'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Offers;
