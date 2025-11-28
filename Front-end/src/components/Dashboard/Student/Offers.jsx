import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import styles from './Offers.module.css';
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

  const mockInternships = [ /* ... SAME mock data ... */ ];

  useEffect(() => {
    setTimeout(() => {
      setAllInternships(mockInternships);
      setFilteredInternships(mockInternships);
      setLoading(false);
    }, 400);
  }, []);

  useEffect(() => {
    let result = allInternships;

    if (filters.speciality)
      result = result.filter(i => i.speciality.toLowerCase() === filters.speciality.toLowerCase());

    if (filters.hospital)
      result = result.filter(i => i.hospital.toLowerCase().includes(filters.hospital.toLowerCase()));

    if (filters.startDate)
      result = result.filter(i => new Date(i.startDate) >= new Date(filters.startDate));

    if (filters.search)
      result = result.filter(i =>
        i.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        i.hospital.toLowerCase().includes(filters.search.toLowerCase()) ||
        i.speciality.toLowerCase().includes(filters.search.toLowerCase())
      );

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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

  const uniqueSpecialities = [...new Set(allInternships.map(i => i.speciality))];
  const uniqueHospitals = [...new Set(allInternships.map(i => i.hospital))];

  if (loading) {
    return (
      <Layout>
        <div className={styles['offers-page']}>
          <div className={styles['loading-container']}>
            <div className={styles['loading-spinner']}></div>
            <p>Chargement des offres de stage...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['offers-page']}>

        <div className={styles['page-header']}>
          <h1 className={styles['detail-title']}>Offres de Stages</h1>
          <p className={styles['page-subtitle']}>Trouvez le stage médical parfait pour votre carrière</p>
        </div>

        <div className={styles['offers-container']}>

          {/* SIDEBAR */}
          <aside className={styles['filters-sidebar']}>

            <div className={styles['filters-header']}>
              <h3 className={styles['hospital-heading']}>Filtres</h3>

              <button
                onClick={() => setFilters({ speciality: '', hospital: '', startDate: '', search: '' })}
                className={styles['reset-filters-btn']}
              >
                Réinitialiser
              </button>
            </div>

            <div className={styles['filter-group']}>
              <label htmlFor="search">Recherche</label>
              <input
                id="search"
                type="text"
                name="search"
                placeholder="Titre, hôpital ou spécialité..."
                value={filters.search}
                onChange={handleFilterChange}
                className={styles['filter-input']}
              />
            </div>

            <div className={styles['filter-group']}>
              <label htmlFor="speciality">Spécialité</label>
              <select
                id="speciality"
                name="speciality"
                value={filters.speciality}
                onChange={handleFilterChange}
                className={styles['filter-select']}
              >
                <option value="">Toutes les spécialités</option>
                {uniqueSpecialities.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className={styles['filter-group']}>
              <label htmlFor="hospital">Hôpital</label>
              <select
                id="hospital"
                name="hospital"
                value={filters.hospital}
                onChange={handleFilterChange}
                className={styles['filter-select']}
              >
                <option value="">Tous les hôpitaux</option>
                {uniqueHospitals.map(hosp => (
                  <option key={hosp} value={hosp}>{hosp}</option>
                ))}
              </select>
            </div>

            <div className={styles['filter-group']}>
              <label htmlFor="startDate">Date de Début (à partir de)</label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className={styles['filter-input']}
              />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className={styles['offers-content']}>

            <div className={styles['results-header']}>
              <p className={styles['results-count']}>
                <strong>{filteredInternships.length}</strong>
                {filteredInternships.length === 1 ? ' offre trouvée' : ' offres trouvées'}
              </p>

              <div className={styles['sort-options']}>
                <select className={styles['sort-select']}>
                  <option>Trier par: Pertinence</option>
                  <option>Date de début</option>
                  <option>Nom de l'hôpital</option>
                </select>
              </div>
            </div>

            {filteredInternships.length === 0 ? (
              <div className={styles['no-results']}>
                <div className={styles['no-results-icon']}>🔍</div>
                <h3>Aucun stage ne correspond à vos critères</h3>
                <p>Essayez de modifier vos filtres ou votre recherche</p>
                <button
                  onClick={() => setFilters({ speciality: '', hospital: '', startDate: '', search: '' })}
                  className={`${styles['reset-filters-btn']} ${styles.large}`}
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : (
              <div className={`${styles['internships-list']} ${styles.compact}`}>
                {filteredInternships.map(internship => (
                  <div key={internship.id} className={`${styles['internship-card']} ${styles.compact}`}>

                    <div className={`${styles['card-image']} ${styles.compact}`}>
                      <img src={internship.hospitalImage} alt={internship.hospital} />
                      <div className={`${styles['card-speciality-badge']} ${styles.compact}`}>
                        {internship.speciality}
                      </div>
                    </div>

                    <div className={`${styles['card-content']} ${styles.compact}`}>
                      <div className={`${styles['card-header']} ${styles.compact}`}>
                        <h3 className={`${styles['card-title']} ${styles.compact}`}>
                          {internship.title}
                        </h3>
                      </div>

                      <p className={`${styles['card-hospital']} ${styles.compact}`}>
                        {internship.hospital}
                      </p>

                      <div className={`${styles['card-details']} ${styles.compact}`}>
                        <div className={styles['detail-row']}>

                          <span className={`${styles['detail-item']} ${styles.compact}`}>
                            <span className={styles['detail-icon']}>📅</span>
                            {formatDate(internship.startDate)}
                          </span>

                          <span className={`${styles['detail-item']} ${styles.compact}`}>
                            <span className={styles['detail-icon']}>📍</span>
                            {internship.address}
                          </span>

                          <span className={`${styles['detail-item']} ${styles.compact}`}>
                            <span className={styles['detail-icon']}>⏱️</span>
                            {internship.duration}
                          </span>

                          <span className={`${styles['detail-item']} ${styles.compact}`}>
                            <span className={styles['detail-icon']}>💰</span>
                            {internship.salary}
                          </span>
                        </div>
                      </div>

                      <p className={`${styles['card-description']} ${styles.compact}`}>
                        {internship.description}
                      </p>

                      <div className={`${styles['card-actions']} ${styles.compact}`}>
                        <Link to={`/internships/${internship.id}`} className={`${styles['apply-btn']} ${styles.compact}`}>
                          Voir détails
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleSave(internship.id, e)}
                      className={`${styles['save-btn']} ${styles.compact} ${savedInternships.includes(internship.id) ? styles.saved : ''}`}
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
