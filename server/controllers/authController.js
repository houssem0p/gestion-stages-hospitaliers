const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Debugging: log incoming values in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Auth.login - incoming body:', { email, passwordType: typeof password });
    }

    if (!email || !password)
      return res.status(400).json({ success:false, message:'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      if (process.env.NODE_ENV === 'development') console.debug('Auth.login - user not found for', email);
      return res.status(400).json({ success:false, message:'Invalid credentials' });
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('Auth.login - user found:', { id:user.id, email:user.email, pwdLength: (user.password || '').length });
    }

    // Ensure password is a string to avoid unexpected compare results
    const plainPassword = typeof password === 'string' ? password : String(password || '');
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (process.env.NODE_ENV === 'development') console.debug('Auth.login - bcrypt.compare result:', isMatch);
    if (!isMatch) return res.status(400).json({ success:false, message:'Invalid credentials' });

    const token = jwt.sign({ userId:user.id, role:user.role }, process.env.JWT_SECRET, { expiresIn:'1d' });

    res.json({
      success:true,
      message:'Login successful',
      token,
      user: { id:user.id, email:user.email, role:user.role, first_name:user.first_name, last_name:user.last_name }
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.userId, { attributes:{ exclude:['password'] } });
  if (!user) return res.status(404).json({ success:false, message:'User not found' });
  res.json({ success:true, user });
};

exports.updateProfile = async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ success:false, message:'User not found' });
  const updated = await user.update(req.body);
  res.json({ success:true, message:'Profile updated', user:updated });
};
