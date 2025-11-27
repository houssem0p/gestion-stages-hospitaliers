import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

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
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/" className="logo-link">
              <h2>StageMed</h2>
            </Link>
          </div>

          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#partners" className="nav-link">
                Nous Contacter
              </a>
            </li>

            <li className="nav-item">
              <Link to="/login" className="nav-link login-btn">
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
      { to: '/doctor/evaluations', label: 'Évaluations' },
      { to: '/messages', label: 'Messagerie' }
    ],
    hospital: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/manage-offers', label: 'Offres de stage' },
      { to: '/received-applications', label: 'Candidatures reçues' },
      { to: '/services', label: 'Services hospitaliers' },
      { to: '/mentors', label: 'Encadrants' },
      { to: '/hospital/reports', label: 'Statistiques & Rapports' },
      { to: '/hospital/messages', label: 'Messagerie' }
    ],
    teacher: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/my-students', label: 'Mes étudiants' },
      { to: '/teacher/evaluations', label: 'Évaluations & Compétences' },
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

  // Support both `hospital` and `hospital_admin` role values
  if (role === 'hospital_admin' && !menus['hospital_admin']) {
    menus['hospital_admin'] = menus['hospital'];
  }

  const activeMenu = menus[role] || menus['admin'] || [];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="logo-link">
            <h2>StageMed</h2>
          </Link>
        </div>

        <ul className="nav-menu">
          {activeMenu.map((item) => (
            <li key={item.to} className="nav-item">
              <Link
                to={item.to}
                className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          <li className="nav-item dropdown">
            <div className="user-info nav-link">
              <span className="user-avatar">{user.first_name?.charAt(0) || user.email?.charAt(0)}</span>
              <span className="user-name">{user.first_name || user.email}</span>
            </div>
            <div className="dropdown-menu">
              <div className="dropdown-item user-role">Rôle: {user.role}</div>
              <button onClick={handleLogout} className="dropdown-item logout-btn">Déconnexion</button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;