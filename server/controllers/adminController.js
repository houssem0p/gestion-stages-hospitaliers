const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authController = {
  // User login
  login: async (req, res) => {
    try {
      console.log('🔐 Login attempt:', req.body.email);
      
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find user by email
      const user = await User.findOne({
        where: { email }
      });

      console.log('📧 User found:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is deactivated. Please contact administrator.' 
        });
      }

      // Check password
      console.log('🔑 Checking password...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('✅ Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('🎉 Login successful for:', user.email);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          specialty: user.specialty,
          phone: user.phone,
          hospital_id: user.hospital_id,
          is_active: user.is_active,
          profile_completed: user.profile_completed
        }
      });

    } catch (error) {
      console.error('💥 Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching profile' 
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, specialty, phone } = req.body;

      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await user.update({
        first_name,
        last_name,
        specialty,
        phone,
        profile_completed: true,
        updated_at: new Date()
      });

      // Return updated user without password
      const updatedUser = { ...user.toJSON() };
      delete updatedUser.password;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating profile' 
      });
    }
  }
};

module.exports = authController;