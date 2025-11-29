import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import authAPI from '../../../services/api';
import './MyStudents.css';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await authAPI.get('/teachers/internships');
        if (response.data.success) {
          // Group by student to avoid duplicates
          const studentMap = new Map();
          (response.data.data || []).forEach(item => {
            const key = item.student_id;
            if (!studentMap.has(key) || !studentMap.get(key).internships) {
              studentMap.set(key, {
                student_id: item.student_id,
                first_name: item.student_first_name,
                last_name: item.student_last_name,
                email: item.student_email,
                matricule: item.matricule,
                student_speciality: item.student_speciality,
                academic_year: item.academic_year,
                internships: []
              });
            }
            studentMap.get(key).internships.push({
              internship_id: item.internship_id,
              title: item.title,
              hospital: item.hospital,
              speciality: item.speciality,
              startDate: item.startDate,
              endDate: item.endDate,
              doctor_first_name: item.doctor_first_name,
              doctor_last_name: item.doctor_last_name
            });
          });
          setStudents(Array.from(studentMap.values()));
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        alert('Failed to load students: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="page"><p>Chargement...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page my-students-page">
        <h2>Mes étudiants / Stagiaires</h2>
        
        {students.length === 0 ? (
          <p>Aucun étudiant assigné pour le moment.</p>
        ) : (
          <div className="students-list">
            {students.map((student) => (
              <div key={student.student_id} className="student-card">
                <div className="student-header">
                  <h3>{student.first_name} {student.last_name}</h3>
                </div>
                
                <div className="student-details">
                  <p><strong>Email:</strong> {student.email}</p>
                  {student.matricule && <p><strong>Matricule:</strong> {student.matricule}</p>}
                  {student.student_speciality && <p><strong>Spécialité:</strong> {student.student_speciality}</p>}
                  {student.academic_year && <p><strong>Année académique:</strong> {student.academic_year}</p>}
                  
                  <div className="student-internships">
                    <strong>Stages:</strong>
                    {student.internships.map((internship, idx) => (
                      <div key={idx} className="internship-item">
                        <p><strong>{internship.title}</strong> - {internship.hospital}</p>
                        {internship.startDate && (
                          <p className="date-info">
                            {new Date(internship.startDate).toLocaleDateString('fr-FR')} - 
                            {internship.endDate ? new Date(internship.endDate).toLocaleDateString('fr-FR') : 'En cours'}
                          </p>
                        )}
                        {internship.doctor_first_name && (
                          <p className="doctor-info">
                            Encadrant: {internship.doctor_first_name} {internship.doctor_last_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="student-actions">
                  <Link to={`/teacher/evaluations?student=${student.student_id}`} className="evaluate-btn">
                    Évaluer
                  </Link>
                  <Link to={`/attestations?student=${student.student_id}`} className="attestation-btn">
                    Attestations
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

export default MyStudents;
