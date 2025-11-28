import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles['footer-container']}>
        
        {/* Main Footer Content */}
        <div className={styles['footer-content']}>
          
          {/* Brand Section */}
          <div className={styles['footer-section']}>
            <h3 className={styles['footer-logo']}>
              <span className={styles['logo-icon']}>🏥</span>
              StageMed
            </h3>
            <p className={styles['footer-description']}>
              Plateforme de gestion des stages médicaux connectant étudiants, 
              établissements de santé et encadrants pour une expérience optimisée.
            </p>
            <div className={styles['social-links']}>
              <a href="#" aria-label="Facebook" className={styles['social-link']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className={styles['social-link']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className={styles['social-link']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles['footer-section']}>
            <h4 className={styles['footer-title']}>Liens Rapides</h4>
            <ul className={styles['footer-links']}>
              <li><Link to="/" className={styles['footer-link']}>Accueil</Link></li>
              <li><a href="#actors" className={styles['footer-link']}>Acteurs</a></li>
              <li><a href="#partners" className={styles['footer-link']}>Partenaires</a></li>
              <li><Link to="/login" className={styles['footer-link']}>Connexion</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles['footer-section']}>
            <h4 className={styles['footer-title']}>Contact</h4>
            <div className={styles['contact-info']}>
              <p className={styles['contact-item']}>
                <span className={styles['contact-icon']}>✉️</span>
                contact@stagemeds.com
              </p>
              <p className={styles['contact-item']}>
                <span className={styles['contact-icon']}>📞</span>
                +213 XXX XXX XXX
              </p>
              <p className={styles['contact-item']}>
                <span className={styles['contact-icon']}>📍</span>
                Boumerdès, Algérie
              </p>
            </div>
          </div>

          {/* Platform Roles */}
          <div className={styles['footer-section']}>
            <h4 className={styles['footer-title']}>Rôles</h4>
            <ul className={styles['footer-links']}>
              <li className={styles['footer-link']}>Étudiant</li>
              <br />
              <li className={styles['footer-link']}>Médecin/Encadrant</li>
              <li className={styles['footer-link']}>Établissement Hospitalier</li>
              <li className={styles['footer-link']}>Enseignant</li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className={styles['footer-bottom']}>
          <div className={styles['footer-bottom-content']}>
            <p>&copy; 2024 StageMed. Tous droits réservés.</p>
            <div className={styles['footer-legal']}>
              <a href="#" className={styles['legal-link']}>Confidentialité</a>
              <a href="#" className={styles['legal-link']}>Conditions</a>
              <a href="#" className={styles['legal-link']}>Mentions légales</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;