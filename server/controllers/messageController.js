const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?.userId || req.user?.id;
    if (!senderId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { receiver_id, message_type, subject, content, internship_id } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ success: false, message: 'receiver_id and content are required' });
    }

    // Insert message
    await sequelize.query(
      `INSERT INTO messages (sender_id, receiver_id, message_type, subject, content, internship_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      { replacements: [senderId, receiver_id, message_type || 'student_mentor', subject || null, content, internship_id || null] }
    );

    const [inserted] = await sequelize.query(
      `SELECT * FROM messages WHERE id = LAST_INSERT_ID() LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const messageId = inserted.id;
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'message_attachments');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      for (const file of req.files) {
        const relativePath = `/uploads/message_attachments/${file.filename}`;
        await sequelize.query(
          `INSERT INTO message_attachments (message_id, file_name, file_path, file_type, created_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          { replacements: [messageId, file.originalname, relativePath, file.mimetype] }
        );
      }
    }

    res.status(201).json({ success: true, data: inserted, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Get messages for current user (inbox)
const getInbox = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const messages = await sequelize.query(
      `SELECT 
         m.*,
         sender.first_name as sender_first_name,
         sender.last_name as sender_last_name,
         sender.email as sender_email,
         receiver.first_name as receiver_first_name,
         receiver.last_name as receiver_last_name,
         receiver.email as receiver_email,
         o.title as internship_title
       FROM messages m
       LEFT JOIN users sender ON m.sender_id = sender.id
       LEFT JOIN users receiver ON m.receiver_id = receiver.id
       LEFT JOIN offers o ON m.internship_id = o.id
       WHERE m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: messages || [] });
  } catch (error) {
    console.error('Error fetching inbox', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Get sent messages
const getSentMessages = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const messages = await sequelize.query(
      `SELECT 
         m.*,
         sender.first_name as sender_first_name,
         sender.last_name as sender_last_name,
         sender.email as sender_email,
         receiver.first_name as receiver_first_name,
         receiver.last_name as receiver_last_name,
         receiver.email as receiver_email,
         o.title as internship_title
       FROM messages m
       LEFT JOIN users sender ON m.sender_id = sender.id
       LEFT JOIN users receiver ON m.receiver_id = receiver.id
       LEFT JOIN offers o ON m.internship_id = o.id
       WHERE m.sender_id = ?
       ORDER BY m.created_at DESC`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: messages || [] });
  } catch (error) {
    console.error('Error fetching sent messages', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sent messages' });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const otherUserId = req.params.userId;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!otherUserId) return res.status(400).json({ success: false, message: 'userId parameter required' });

    const messages = await sequelize.query(
      `SELECT 
         m.*,
         sender.first_name as sender_first_name,
         sender.last_name as sender_last_name,
         sender.email as sender_email,
         receiver.first_name as receiver_first_name,
         receiver.last_name as receiver_last_name,
         receiver.email as receiver_email,
         o.title as internship_title
       FROM messages m
       LEFT JOIN users sender ON m.sender_id = sender.id
       LEFT JOIN users receiver ON m.receiver_id = receiver.id
       LEFT JOIN offers o ON m.internship_id = o.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      { replacements: [userId, otherUserId, otherUserId, userId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: messages || [] });
  } catch (error) {
    console.error('Error fetching conversation', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const messageId = req.params.id;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!messageId) return res.status(400).json({ success: false, message: 'message id required' });

    // Only mark as read if user is the receiver
    await sequelize.query(
      `UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ? AND receiver_id = ?`,
      { replacements: [messageId, userId] }
    );

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read' });
  }
};

// Mark all messages as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    await sequelize.query(
      `UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE receiver_id = ? AND is_read = FALSE`,
      { replacements: [userId] }
    );

    res.json({ success: true, message: 'All messages marked as read' });
  } catch (error) {
    console.error('Error marking all messages as read', error);
    res.status(500).json({ success: false, message: 'Failed to mark all messages as read' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const [result] = await sequelize.query(
      `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, count: result?.count || 0 });
  } catch (error) {
    console.error('Error fetching unread count', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};

// Get recipients for current user based on internship relationships
const getRecipients = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userRole = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    let recipients = [];

    if (userRole === 'student') {
      // Students can message doctors, teachers, and hospitals from their internships
      const query = `
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ip.internship_id,
          o.title as internship_title,
          'doctor' as relationship_type
        FROM internship_participants ip
        JOIN users u ON ip.doctor_id = u.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.student_id = ? AND ip.role = 'student' AND ip.status = 'active'
          AND ip.doctor_id IS NOT NULL
        
        UNION
        
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ip.internship_id,
          o.title as internship_title,
          'teacher' as relationship_type
        FROM internship_participants ip
        JOIN users u ON ip.teacher_id = u.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.student_id = ? AND ip.role = 'student' AND ip.status = 'active'
          AND ip.teacher_id IS NOT NULL
        
        UNION
        
        SELECT DISTINCT
          h.id,
          h.name as first_name,
          '' as last_name,
          h.email,
          'hospital_admin' as role,
          ip.internship_id,
          o.title as internship_title,
          'hospital' as relationship_type
        FROM internship_participants ip
        JOIN hospitals h ON ip.hospital_id = h.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.student_id = ? AND ip.role = 'student' AND ip.status = 'active'
          AND ip.hospital_id IS NOT NULL
      `;
      
      recipients = await sequelize.query(query, {
        replacements: [userId, userId, userId],
        type: QueryTypes.SELECT
      });
    } else if (userRole === 'doctor') {
      // Doctors can message students and teachers from their internships
      const query = `
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ip.internship_id,
          o.title as internship_title,
          'student' as relationship_type
        FROM internship_participants ip
        JOIN users u ON ip.student_id = u.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.doctor_id = ? AND ip.role = 'doctor' AND ip.status = 'active'
          AND ip.student_id IS NOT NULL
        
        UNION
        
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ip.internship_id,
          o.title as internship_title,
          'teacher' as relationship_type
        FROM internship_participants ip
        JOIN users u ON ip.teacher_id = u.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.doctor_id = ? AND ip.role = 'doctor' AND ip.status = 'active'
          AND ip.teacher_id IS NOT NULL
      `;
      
      recipients = await sequelize.query(query, {
        replacements: [userId, userId],
        type: QueryTypes.SELECT
      });
    } else if (userRole === 'teacher') {
      // Teachers can message students and doctors from their internships
      const query = `
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ip.internship_id,
          o.title as internship_title,
          'student' as relationship_type
        FROM internship_participants ip
        JOIN users u ON ip.student_id = u.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.teacher_id = ? AND ip.role = 'teacher' AND ip.status = 'active'
          AND ip.student_id IS NOT NULL
        
        UNION
        
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ip.internship_id,
          o.title as internship_title,
          'doctor' as relationship_type
        FROM internship_participants ip
        JOIN users u ON ip.doctor_id = u.id
        JOIN offers o ON ip.internship_id = o.id
        WHERE ip.teacher_id = ? AND ip.role = 'teacher' AND ip.status = 'active'
          AND ip.doctor_id IS NOT NULL
      `;
      
      recipients = await sequelize.query(query, {
        replacements: [userId, userId],
        type: QueryTypes.SELECT
      });
    } else if (userRole === 'hospital_admin') {
      // Hospital admins can message students, doctors, and teachers from their hospital's internships
      const hospitalId = req.user?.hospital_id;
      if (hospitalId) {
        // Get hospital name first
        const [hospital] = await sequelize.query(
          `SELECT name FROM hospitals WHERE id = ? LIMIT 1`,
          { replacements: [hospitalId], type: QueryTypes.SELECT }
        );

        if (hospital) {
          const query = `
            SELECT DISTINCT
              u.id,
              u.first_name,
              u.last_name,
              u.email,
              u.role,
              ip.internship_id,
              o.title as internship_title,
              CASE 
                WHEN ip.student_id = u.id THEN 'student'
                WHEN ip.doctor_id = u.id THEN 'doctor'
                WHEN ip.teacher_id = u.id THEN 'teacher'
              END as relationship_type
            FROM internship_participants ip
            JOIN users u ON (ip.student_id = u.id OR ip.doctor_id = u.id OR ip.teacher_id = u.id)
            JOIN offers o ON ip.internship_id = o.id
            WHERE o.hospital = ? AND ip.status = 'active'
              AND (ip.student_id IS NOT NULL OR ip.doctor_id IS NOT NULL OR ip.teacher_id IS NOT NULL)
          `;
          
          recipients = await sequelize.query(query, {
            replacements: [hospital.name],
            type: QueryTypes.SELECT
          });
        }
      }
    }

    res.json({ success: true, data: recipients || [] });
  } catch (error) {
    console.error('Error fetching recipients', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipients' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const messageId = req.params.id;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!messageId) return res.status(400).json({ success: false, message: 'message id required' });

    // Only allow deletion if user is sender or receiver
    await sequelize.query(
      `DELETE FROM messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)`,
      { replacements: [messageId, userId, userId] }
    );

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message', error);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

// Get message attachments
const getMessageAttachments = async (req, res) => {
  try {
    const messageId = req.params.id;
    if (!messageId) return res.status(400).json({ success: false, message: 'message id required' });

    const attachments = await sequelize.query(
      `SELECT * FROM message_attachments WHERE message_id = ? ORDER BY created_at ASC`,
      { replacements: [messageId], type: QueryTypes.SELECT }
    );

    // Normalize file paths
    const normalizedAttachments = (attachments || []).map(att => ({
      ...att,
      file_path: att.file_path.startsWith('/uploads/') ? att.file_path : `/uploads/message_attachments/${att.file_path}`
    }));

    res.json({ success: true, data: normalizedAttachments });
  } catch (error) {
    console.error('Error fetching message attachments', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attachments' });
  }
};

module.exports = {
  sendMessage,
  getInbox,
  getSentMessages,
  getConversation,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteMessage,
  getMessageAttachments,
  getRecipients
};

