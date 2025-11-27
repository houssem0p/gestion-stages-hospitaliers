import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import './Offers.css';
import authAPI from '../../../services/api';

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

<<<<<<< HEAD
  // Mock data - replace with API call
  const mockInternships = [
    {
      id: 1,
      title: 'Cardiology Internship',
      hospital: 'General Hospital',
      hospitalImage: '/mnt/data/f67df839-cfe4-41c9-aea2-86dbaf0f68d4.png',
      speciality: 'Cardiology',
      startDate: '2024-01-15',
      address: 'Cairo, Egypt',
      description: 'Learn about cardiac care and patient management.',
      duration: '6 months',
      salary: '$1,200/month'
    },
    {
      id: 2,
      title: 'Neurology Internship',
      hospital: 'Saint Johns Hospital',
      hospitalImage: '/assets/hospital2.jpg',
      speciality: 'Neurology',
      startDate: '2024-02-01',
      address: 'Alexandria, Egypt',
      description: 'Explore neurological disorders and treatments.',
      duration: '12 months',
      salary: '$1,500/month'
    },
    {
      id: 3,
      title: 'Pediatrics Internship',
      hospital: "Children's Medical Center",
      hospitalImage: '/assets/hospital3.jpg',
      speciality: 'Pediatrics',
      startDate: '2024-01-20',
      address: 'Giza, Egypt',
      description: 'Work with pediatric patients and develop clinical skills.',
      duration: '8 months',
      salary: '$1,300/month'
    },
    {
      id: 4,
      title: 'Surgery Internship',
      hospital: 'Trauma Center',
      hospitalImage: '/assets/hospital4.jpg',
      speciality: 'Surgery',
      startDate: '2024-03-01',
      address: 'Cairo, Egypt',
      description: 'Gain surgical experience in emergency and elective cases.',
      duration: '12 months',
      salary: '$1,800/month'
    },
    {
      id: 5,
      title: 'Oncology Internship',
      hospital: 'Cancer Research Institute',
      hospitalImage: '/assets/hospital5.jpg',
      speciality: 'Oncology',
      startDate: '2024-02-15',
      address: 'Helwan, Egypt',
      description: 'Learn about cancer treatment and patient care.',
      duration: '6 months',
      salary: '$1,400/month'
    },
    {
      id: 6,
      title: 'Emergency Medicine',
      hospital: 'General Hospital',
      hospitalImage: '/assets/hospital1.jpg',
      speciality: 'Emergency Medicine',
      startDate: '2024-01-25',
      address: 'Cairo, Egypt',
      description: 'Handle emergency cases and acute patient situations.',
      duration: '10 months',
      salary: '$1,600/month'
    }
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setAllInternships(mockInternships);
      setFilteredInternships(mockInternships);
      setLoading(false);
    }, 400);

  }, []);

  useEffect(() => {
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
        i.hospital.toLowerCase().includes(filters.search.toLowerCase()) ||
        i.speciality.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredInternships(result);
  }, [filters, allInternships]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSave = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedInternships(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const uniqueSpecialities = [...new Set(allInternships.map(i => i.speciality))];
  const uniqueHospitals = [...new Set(allInternships.map(i => i.hospital))];

  if (loading) {
    return (
      <Layout>
        <div className="offers-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des offres de stage...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="offers-page">
        <div className="page-header">
          <h1>Offres de Stages</h1>
          <p className="page-subtitle">Trouvez le stage médical parfait pour votre carrière</p>
        </div>

        <div className="offers-container">
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filtres</h3>
              <button
                onClick={() => setFilters({ speciality: '', hospital: '', startDate: '', search: '' })}
                className="reset-filters-btn"
              >
                Réinitialiser
              </button>
            </div>

            <div className="filter-group">
              <label htmlFor="search">Recherche</label>
              <input
                id="search"
                type="text"
                name="search"
                placeholder="Titre, hôpital ou spécialité..."
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
          </aside>

          <div className="offers-content">
            <div className="results-header">
              <p className="results-count">
                <strong>{filteredInternships.length}</strong>
                {filteredInternships.length === 1 ? ' offre trouvée' : ' offres trouvées'}
              </p>
              <div className="sort-options">
                <select className="sort-select">
                  <option>Trier par: Pertinence</option>
                  <option>Date de début</option>
                  <option>Nom de l'hôpital</option>
                </select>
              </div>
            </div>

            {filteredInternships.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>Aucun stage ne correspond à vos critères</h3>
                <p>Essayez de modifier vos filtres ou votre recherche</p>
                <button
                  onClick={() => setFilters({ speciality: '', hospital: '', startDate: '', search: '' })}
                  className="reset-filters-btn large"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : (
              <div className="internships-list compact">
                {filteredInternships.map(internship => (
                  <div key={internship.id} className="internship-card compact">
                    <div className="card-image compact">
                      <img src={internship.hospitalImage} alt={internship.hospital} />
                      <div className="card-speciality-badge compact">{internship.speciality}</div>
                    </div>

                    <div className="card-content compact">
                      <div className="card-header compact">
                        <h3 className="card-title compact">{internship.title}</h3>
                      </div>

                      <p className="card-hospital compact">{internship.hospital}</p>

                      <div className="card-details compact">
                        <div className="detail-row">
                          <span className="detail-item compact">
                            <span className="detail-icon">📅</span>
                            {formatDate(internship.startDate)}
                          </span>
                          <span className="detail-item compact">
                            <span className="detail-icon">📍</span>
                            {internship.address}
                          </span>
                          <span className="detail-item compact">
                            <span className="detail-icon">⏱️</span>
                            {internship.duration}
                          </span>
                          <span className="detail-item compact">
                            <span className="detail-icon">💰</span>
                            {internship.salary}
                          </span>
                        </div>
                      </div>

                      <p className="card-description compact">{internship.description}</p>

                      <div className="card-actions compact">
                        <Link to={`/internships/${internship.id}`} className="apply-btn compact">
                          Voir détails
                        </Link>
                      </div>
                    </div>

                    {/* Save button pinned top-right of the card */}
                    <button
                    onClick={(e) => toggleSave(internship.id, e)}
                    className={`save-btn compact ${savedInternships.includes(internship.id) ? 'saved' : ''}`}
                  >
                    {savedInternships.includes(internship.id) ? "🔖" : "📑"}
                  </button>

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
