const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

// Setup multer for message attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'message_attachments');
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Send a message (with optional file attachments)
router.post('/', verifyToken, upload.array('attachments', 5), messageController.sendMessage);

// Get inbox (received messages)
router.get('/inbox', verifyToken, messageController.getInbox);

// Get sent messages
router.get('/sent', verifyToken, messageController.getSentMessages);

// Get conversation with a specific user
router.get('/conversation/:userId', verifyToken, messageController.getConversation);

// Get unread message count
router.get('/unread-count', verifyToken, messageController.getUnreadCount);

// Get recipients based on internship relationships
router.get('/recipients', verifyToken, messageController.getRecipients);

// Mark message as read
router.put('/:id/read', verifyToken, messageController.markAsRead);

// Mark all messages as read
router.put('/read-all', verifyToken, messageController.markAllAsRead);

// Get message attachments
router.get('/:id/attachments', verifyToken, messageController.getMessageAttachments);

// Delete message
router.delete('/:id', verifyToken, messageController.deleteMessage);

module.exports = router;

