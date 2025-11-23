import React from 'react';
import Layout from '../components/Layout/Layout';
import HeroSection from '../components/Landing/HeroSection/HeroSection';
import ActorSection from '../components/Landing/ActorSection/ActorSection';
import PartnersSection from '../components/Landing/PartnersSection/PartnersSection';
import './LandingPage.css';

const LandingPage = () => {
  const actors = [
    {
      id: 1,
      role: 'Étudiant',
      image: '/assets/student.jpg',
      description: [
        'Complète son profil et téléverse ses pièces justificatives',
        'Consulte les offres de stage disponibles',
        'Postule aux stages et suit l\'état de ses candidatures',
        'Reçoit les évaluations et attestations de fin de stage',
        'Communique avec ses encadrants via la messagerie interne'
      ],
      imagePosition: 'left'
    },
    {
      id: 2,
      role: 'Médecin / Encadrant',
      image: '/assets/doctor.jpg',
      description: [
        'Consulte la liste des stagiaires affectés à son service',
        'Évalue les étudiants en fin de stage selon une grille de compétences',
        'Communique avec les stagiaires via la messagerie interne'
      ],
      imagePosition: 'right'
    },
    {
      id: 3,
      role: 'Établissement hospitalier (EPSP, CHU, etc.)',
      image: '/assets/hospital.jpg',
      description: [
        'Publie les offres de stage (titre, durée, lieu, nombre de places, évaluation)',
        'Gère et valide les candidatures reçues',
        'Supervise les services et les encadrants'
      ],
      imagePosition: 'left'
    },
    {
      id: 4,
      role: 'Enseignant / Encadrant',
      image: '/assets/teacher.jpg',
      description: [
        'Gère sa disponibilité pour encadrer',
        'Consulte les fiches de ses stagiaires',
        'Évalue les étudiants et valide leurs compétences',
        'Génère et signe l\'attestation de stage',
        'Communique avec le stagiaire via messagerie interne'
      ],
      imagePosition: 'right'
    }
  ];

  const partners = [
    '/assets/partners/partner1.png',
    '/assets/partners/partner2.png',
    '/assets/partners/partner3.png',
    '/assets/partners/partner4.png',
    '/assets/partners/partner5.png',
    '/assets/partners/partner6.png',
    '/assets/partners/partner7.png',
  ];

  return (
    <Layout>
      <div className="landing-page">
        <HeroSection />
        
        {/* Actors Section */}
        <section className="actors-section" id="actors">
          <div className="container">
            <h2 className="section-title">Les Acteurs de Notre Plateforme</h2>
            <p className="section-subtitle">
              Découvrez comment chaque acteur contribue au succès des stages médicaux
            </p>
            
            {actors.map((actor) => (
              <ActorSection
                key={actor.id}
                role={actor.role}
                image={actor.image}
                description={actor.description}
                imagePosition={actor.imagePosition}
              />
            ))}
          </div>
        </section>

        <PartnersSection partners={partners} />
      </div>
    </Layout>
  );
};

export default LandingPage;