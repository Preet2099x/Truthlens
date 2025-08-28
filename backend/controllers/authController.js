// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'
function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic guard (express-validator will also run)
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required.' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use.' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('[Signup Error]', err.message);
    res.status(500).json({ error: 'Could not create account.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = signToken(user._id);
    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('[Login Error]', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
};

export const me = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    console.error('[Me Error]', err.message);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};
