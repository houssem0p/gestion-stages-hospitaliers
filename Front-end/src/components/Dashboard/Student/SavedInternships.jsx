import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import styles from './SavedInternships.module.css';

const SavedInternships = () => {
  const [savedInternships, setSavedInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch saved internships from backend
    // For now, mock data
    const mockData = [
      {
        id: 1,
        title: 'Internship in Cardiology',
        hospital: 'General Hospital',
        hospitalImage: '/assets/hospital1.jpg',
        speciality: 'Cardiology',
        startDate: '2024-01-15',
        address: 'Cairo, Egypt',
        description: 'Learn about cardiac care and patient management.'
      }
    ];
    setTimeout(() => {
      setSavedInternships(mockData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className={styles.page}><p>Loading...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['saved-internships-page']}>
        <h2>Internships Sauvegardées</h2>
      {savedInternships.length === 0 ? (
        <p>Vous n'avez aucun internship sauvegardé.</p>
      ) : (
        <div className={styles['internships-list']}>
          {savedInternships.map((internship) => (
            <div key={internship.id} className={styles['internship-card']}>
              <div className={styles['internship-image']}>
                <img src={internship.hospitalImage} alt={internship.hospital} />
              </div>
              <div className={styles['internship-info']}>
                <h3>{internship.title}</h3>
                <p className={styles['hospital-name']}>{internship.hospital}</p>
                <p className={styles.speciality}>{internship.speciality}</p>
                <p className={styles.date}>Date de début: {internship.startDate}</p>
                <p className={styles.address}>{internship.address}</p>
                <Link to={`/internships/${internship.id}`} className={styles['view-btn']}>
                  Voir Détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default SavedInternships;
