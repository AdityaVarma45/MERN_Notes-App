import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


const router = express.Router();
router.use(express.json());

//register route

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Registration logic here
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    })


  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } 
})

//login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  try {
    if(!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    
    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  } 
});

//me route
router.get('/me', protect, async (req, res) => {
  res.status(200).json(req.user);
});

//Genarate JWT
const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

export default router;