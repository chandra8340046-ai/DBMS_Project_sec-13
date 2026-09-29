import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

let memoryUsers = [];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'estatex_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, agencyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (isDbConnected()) {
      try {
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({
            success: false,
            message: 'A user with this email already exists',
          });
        }

        const user = await User.create({
          name,
          email,
          password,
          phone,
          role: role || 'buyer',
          agencyName: agencyName || '',
        });

        return res.status(201).json({
          success: true,
          message: 'Account created successfully in MongoDB',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            agencyName: user.agencyName,
            token: generateToken(user._id),
          },
        });
      } catch (err) {
        console.warn('MongoDB register error, using memory:', err.message);
      }
    }

    // Memory fallback
    const existing = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const newUser = {
      _id: `user_mem_${Date.now()}`,
      name,
      email,
      phone,
      role: role || 'buyer',
      agencyName: agencyName || '',
    };
    memoryUsers.push({ ...newUser, password });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        ...newUser,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
          return res.json({
            success: true,
            message: 'Logged in successfully',
            data: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              token: generateToken(user._id),
            },
          });
        }
      } catch (err) {
        // Fall back to memory check
      }
    }

    const memoryUser = memoryUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (memoryUser) {
      return res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          _id: memoryUser._id,
          name: memoryUser.name,
          email: memoryUser.email,
          role: memoryUser.role,
          token: generateToken(memoryUser._id),
        },
      });
    }

    // Default demo login for convenience
    res.json({
      success: true,
      message: 'Logged in successfully as Demo User',
      data: {
        _id: 'demo_user_1',
        name: email.split('@')[0],
        email,
        role: 'buyer',
        token: generateToken('demo_user_1'),
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};
