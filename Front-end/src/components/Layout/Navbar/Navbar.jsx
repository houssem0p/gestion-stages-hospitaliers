import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If no authenticated user, show the simple landing navbar
  if (!user) {
    return (
      <nav className={styles.navbar}>
        <div className={styles['nav-container']}>
          <div className={styles['nav-logo']}>
            <Link to="/" className={styles['logo-link']}>
              <h2>StageMed</h2>
            </Link>
          </div>

          <ul className={styles['nav-menu']}>
            <li className={styles['nav-item']}>
              <a href="#partners" className={styles['nav-link']}>
                Nous Contacter
              </a>
            </li>

            <li className={styles['nav-item']}>
              <Link to="/login" className={`${styles['nav-link']} ${styles['login-btn']}`}>
                Se Connecter
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  // Role-specific menus
  const role = (user.role || '').toLowerCase();

  const menus = {
    student: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/profile', label: 'Profil' },
      { to: '/internships', label: 'Offres de stages' },
      { to: '/saved-internships', label: 'Mes internships sauvegardées' },
      { to: '/applications', label: 'Mes candidatures' },
      { to: '/my-stages', label: 'Mes stages' },
      { to: '/evaluations', label: 'Évaluations & Attestations' },
      { to: '/messages', label: 'Messagerie' }
    ],
    doctor: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/my-trainees', label: 'Mes stagiaires' },
      { to: '/evaluations', label: 'Évaluations' },
      { to: '/messages', label: 'Messagerie' }
    ],
    hospital: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/internships/manage', label: 'Offres de stage' },
      { to: '/applications/received', label: 'Candidatures reçues' },
      { to: '/services', label: 'Services hospitaliers' },
      { to: '/mentors', label: 'Encadrants' },
      { to: '/reports', label: 'Statistiques & Rapports' },
      { to: '/messages', label: 'Messagerie' }
    ],
    teacher: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/my-students', label: 'Mes étudiants' },
      { to: '/evaluations', label: 'Évaluations & Compétences' },
      { to: '/attestations', label: 'Attestations' },
      { to: '/messages', label: 'Messagerie' },
      { to: '/availability', label: 'Disponibilité' }
    ],

    admin: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Utilisateurs' },
      { to: '/admin/stats', label: 'Statistiques' },
      { to: '/messages', label: 'Messagerie' }
    ],
    super_admin: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Utilisateurs' },
      { to: '/admin/stats', label: 'Statistiques' },
      { to: '/messages', label: 'Messagerie' }
    ]
  };

  const activeMenu = menus[role] || menus['admin'] || [];

  return (
    <nav className={styles.navbar}>
      <div className={styles['nav-container']}>
        <div className={styles['nav-logo']}>
          <Link to="/" className={styles['logo-link']}>
            <h2>StageMed</h2>
          </Link>
        </div>

        <ul className={styles['nav-menu']}>
          {activeMenu.map((item) => (
            <li key={item.to} className={styles['nav-item']}>
              <Link
                to={item.to}
                className={`${styles['nav-link']} ${location.pathname === item.to ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          <li className={`${styles['nav-item']} ${styles.dropdown}`}>
            <div className={`${styles['user-info']} ${styles['nav-link']}`}>
              <span className={styles['user-avatar']}>{user.first_name?.charAt(0) || user.email?.charAt(0)}</span>
              <span className={styles['user-name']}>{user.first_name || user.email}</span>
            </div>
            <div className={styles['dropdown-menu']}>
              <div className={`${styles['dropdown-item']} ${styles['user-role']}`}>Rôle: {user.role}</div>
              <button onClick={handleLogout} className={`${styles['dropdown-item']} ${styles['logout-btn']}`}>Déconnexion</button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;