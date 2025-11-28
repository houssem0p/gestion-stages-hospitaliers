import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return(
    <section className={styles['hero-section']}>
      
      {/* 🌟 ECG ANIMATION BACKGROUND 🌟 */}
      <div className={styles['ecg-container']}>
          <svg viewBox="0 0 800 300" preserveAspectRatio="none">
              <path 
                  className={styles.heartbeat} 
                  d="M0,150 L120,150 L150,140 L165,150 L200,150 L240,150 L275,90 L310,150 L350,150 L380,150 L420,200 L460,150 L500,150 L550,150 L600,90 L640,150 L700,150 L800,150" 
              />
          </svg>
      </div>
      {/* ---------------------------------- */}
      
      <div className={styles['hero-container']}>
        <div className={styles['hero-text']}>
          <h1 className={styles['hero-title']}>
            Plateforme de Gestion des 
            <span> Stages Médicaux</span>
          </h1>
          <p className={styles['hero-description']}>
            Solution complète pour connecter étudiants, médecins et établissements de santé. 
            Optimisez la gestion des stages, l'encadrement et l'évaluation.
          </p>
          <div className={styles['hero-buttons']}>
            {/* Added a decorative arrow element for creative primary button styling */}
            <Link to="/login" className={`${styles.btn} ${styles['btn-primary']}`}>
              Commencer Maintenant
              <span className={styles['btn-arrow']}>→</span> 
            </Link>
            <a href="#actors" className={`${styles.btn} ${styles['btn-secondary']}`}>
              Découvrir les Acteurs
            </a>
          </div>
          <div className={styles['hero-features']}>
            <div className={styles.feature}>
              <span className={styles['feature-number']}>1000+</span>
              <span className={styles['feature-label']}>Étudiants</span>
            </div>
            <div className={styles.feature}>
              <span className={styles['feature-number']}>200+</span>
              <span className={styles['feature-label']}>Médecins</span>
            </div>
            <div className={styles.feature}>
              <span className={styles['feature-number']}>50+</span>
              <span className={styles['feature-label']}>Hôpitaux</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;