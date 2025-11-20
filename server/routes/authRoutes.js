const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/profile', authMiddleware.verifyToken, authController.updateProfile);

// Get all users (super admin only)
router.get('/users', authMiddleware.verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Delete user (super admin only)
router.delete('/users/:id', authMiddleware.verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }

    const userId = req.params.id;
    
    // Prevent deleting yourself or the main admin (ID 1)
    if (userId == req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account.'
      });
    }

    if (userId == 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the main administrator account.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Toggle user status (super admin only)
router.put('/users/:id/status', authMiddleware.verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }

    const userId = req.params.id;
    const { is_active } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await user.update({ is_active });

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

module.exports = router;