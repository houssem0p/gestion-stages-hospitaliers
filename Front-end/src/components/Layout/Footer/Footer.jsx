import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Main Footer Content */}
        <div className="footer-content">
          
          {/* Brand Section */}
          <div className="footer-section">
            <h3 className="footer-logo">StageMed</h3>
            <p className="footer-description">
              Plateforme de gestion des stages médicaux connectant étudiants, 
              établissements de santé et encadrants pour une expérience optimisée.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <ul className="footer-links">
              <li><Link to="/">Accueil</Link></li>
              <li><a href="#actors">Acteurs</a></li>
              <li><a href="#partners">Partenaires</a></li>
              <li><Link to="/login">Connexion</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="contact-info">
              <p>📧 contact@stagemeds.com</p>
              <p>📞 +212 XXX XXX XXX</p>
              <p>📍 Casablanca, Maroc</p>
            </div>
          </div>

          {/* Platform Roles */}
          <div className="footer-section">
            <h4>Rôles</h4>
            <ul className="footer-links">
              <li>Étudiant</li>
              <li>Médecin/Encadrant</li>
              <li>Établissement Hospitalier</li>
              <li>Enseignant</li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 StageMed. Tous droits réservés.</p>
            <div className="footer-legal">
              <a href="#">Confidentialité</a>
              <a href="#">Conditions</a>
              <a href="#">Mentions légales</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;