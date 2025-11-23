const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success:false, message:'Access denied. Super admin only.' });
  }
  next();
});

router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.put('/users/:id/status', userController.toggleUserStatus);
router.get('/stats', userController.getDashboardStats);

module.exports = router;
