import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Plateforme de Gestion des 
              <span className="highlight"> Stages Médicaux</span>
            </h1>
            <p className="hero-description">
              Une solution complète pour faciliter la gestion des stages médicaux, 
              connecter les étudiants avec les établissements de santé, et optimiser 
              le processus d'encadrement et d'évaluation.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Commencer Maintenant
              </Link>
              <a href="#actors" className="btn btn-secondary">
                Découvrir les Acteurs
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Étudiants</span>
              </div>
              <div className="stat">
                <span className="stat-number">200+</span>
                <span className="stat-label">Médecins</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Hôpitaux</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image">
              <img 
                src="/assets/hero-medical.jpg" 
                alt="Plateforme de gestion des stages médicaux" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;