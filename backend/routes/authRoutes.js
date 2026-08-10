import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RolePermission from '../models/RolePermission.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    console.log(`[Auth] Login attempt: email="${cleanEmail}"`);

    // Find user by email and password
    const user = await User.findOne({ email: cleanEmail, password: cleanPassword });
    if (!user) {
      console.log(`[Auth] Login failed: No matching user found for email="${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }



    // Set user to Active on successful login
    user.status = 'Active';

    // Get the permissions for the user's role
    const rolePermission = await RolePermission.findOne({ role: user.role });
    const permissions = rolePermission ? rolePermission.permissions : {
      dashboard: {},
      data: {},
      management: {},
      crud: {}
    };

    // Update last login
    user.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
    await user.save();

    // Generate JWT Token (including password as requested by the user, though NOT recommended)
    const token = jwt.sign(
      { 
        empId: user.empId, 
        role: user.role, 
        email: user.email,
        password: user.password // Note: Highly insecure, added as explicitly requested
      },
      process.env.JWT_SECRET || 'fallback_secret_astroved_bi',
      { expiresIn: '4h' }
    );

    res.json({
      user: {
        empId: user.empId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation
      },
      permissions,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { empId } = req.body;
    if (!empId) {
      return res.status(400).json({ message: 'empId is required' });
    }

    const user = await User.findOne({ empId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set user to Inactive on logout
    user.status = 'Inactive';
    await user.save();

    res.json({ message: 'Logout successful, user status set to Inactive' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
