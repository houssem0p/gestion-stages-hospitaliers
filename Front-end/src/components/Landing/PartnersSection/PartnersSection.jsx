import React from 'react';
import { Link } from 'react-router-dom';
import './PartnersSection.css';

const PartnersSection = ({ partners }) => {
  return (
    <section className="partners-section" id="partners">
      <div className="partners-container">
        <div className="partners-header">
          <h2 className="partners-title">Nos Partenaires de Confiance</h2>
          <p className="partners-subtitle">
            Collaborons avec les meilleurs établissements de santé pour offrir 
            des stages de qualité à nos étudiants
          </p>
        </div>

        <div className="partners-scroll-container">
          <div className="partners-scroll">
            <div className="partners-track">
              {partners.concat(partners).map((partner, index) => (
                <div key={index} className="partner-logo">
                  <img src={partner} alt={`Partner ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="partners-cta">
          <h3>Prêt à rejoindre notre plateforme ?</h3>
          <p>Connectez-vous pour accéder à toutes les fonctionnalités</p>
          <Link to="/login" className="cta-button">
            Se Connecter à la Plateforme
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;