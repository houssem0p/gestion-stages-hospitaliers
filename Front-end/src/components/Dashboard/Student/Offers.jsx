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

  // Fetch internships from API
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const response = await authAPI.get('/internships');
        if (response.data.success) {
          const internships = response.data.data || [];
          // Transform data to match frontend format
          const formattedInternships = internships.map(internship => ({
            ...internship,
            hospitalImage: '/assets/hospital1.jpg', // Default image
            duration: internship.startDate && internship.endDate 
              ? `${Math.ceil((new Date(internship.endDate) - new Date(internship.startDate)) / (1000 * 60 * 60 * 24 * 30))} months`
              : 'N/A',
            salary: 'Non spécifié' // Default if not in database
          }));
          setAllInternships(formattedInternships);
          setFilteredInternships(formattedInternships);
        }
      } catch (error) {
        console.error('Failed to fetch internships:', error);
        alert('Failed to load internships: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedInternships = async () => {
      try {
        const response = await authAPI.get('/students/saved-internships');
        if (response.data.success) {
          const saved = response.data.data || [];
          setSavedInternships(saved.map(si => si.id));
        }
      } catch (error) {
        console.error('Failed to fetch saved internships:', error);
        // Don't show alert for this, just log
      }
    };

    fetchInternships();
    fetchSavedInternships();
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

  const toggleSave = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const isSaved = savedInternships.includes(id);
      if (isSaved) {
        // Remove from saved
        await authAPI.delete(`/students/saved-internships/${id}`);
        setSavedInternships(prev => prev.filter(i => i !== id));
      } else {
        // Add to saved
        await authAPI.post('/students/saved-internships', { internship_id: id });
        setSavedInternships(prev => [...prev, id]);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
      alert('Failed to update saved internships');
    }
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
