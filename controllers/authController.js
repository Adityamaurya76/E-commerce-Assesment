import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {

    return res.status(400).json({success: false, message: 'User already exists with this email'});
  }
  const user = await User.create({name, email, password, role: role});

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({success: true, message: 'User registered successfully', data: {user: {id: user._id, name: user.name, email: user.email, role: user.role}, token}});
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('password');
  if (!user) {

    return res.status(401).json({success: false, message: 'Invalid email or password'});
  }
  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {

    return res.status(401).json({success: false, message: 'Invalid email or password'});
  }
  const token = generateToken(user._id);

  res.json({success: true, message: 'Login successful', data: {user: {id: user._id, name: user.name, email: user.email, role: user.role}, token}});
});

const getUser = asyncHandler(async (req, res) => {

  res.json({success: true, data: { user: req.user}});
});

export {
  register,
  login,
  getUser
};

