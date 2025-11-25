const { sequelize } = require('../config/database');

// Usage: node utils/seedEvaluation.js <studentId> <internshipId>
// Example: node utils/seedEvaluation.js 10 2

const main = async () => {
  const args = process.argv.slice(2);
  const studentId = args[0] || 10;
  const internshipId = args[1] || 1;

  try {
    console.log(`Seeding evaluation for student ${studentId}, internship ${internshipId}`);

    // Simple sample scores object
    const sampleScores = {
      "Professionalism": { "Punctuality": 4, "Behavior": 5 },
      "Clinical Skills": { "History Taking": 4, "Physical Exam": 3 }
    };

    // Insert evaluation
    await sequelize.query(
      `INSERT INTO evaluations (internship_id, student_id, doctor_id, scores, comments, final_grade, created_at, updated_at)
       VALUES (?, ?, NULL, ?, ?, ?, NOW(), NOW())`,
      { replacements: [internshipId, studentId, JSON.stringify(sampleScores), 'Seeded evaluation for testing', 'B'] }
    );

    const inserted = await sequelize.query(`SELECT * FROM evaluations WHERE id = LAST_INSERT_ID()`, { type: sequelize.QueryTypes.SELECT });
    console.log('Inserted evaluation:', inserted[0]);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed evaluation', err);
    process.exit(1);
  }
};

main();
