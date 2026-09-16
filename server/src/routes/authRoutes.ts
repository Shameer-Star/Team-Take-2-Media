import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, runQuery } from '../database';
import { JWT_SECRET, authenticateToken, logAudit } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = queryOne(`
      SELECT u.id, u.name, u.email, u.password_hash, u.designation, u.is_active, u.target_points, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE LOWER(u.email) = LOWER(?)
    `, [email.trim()]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Compute dynamic points
    const pointsRow = queryOne(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM points_transactions
      WHERE user_id = ?
    `, [user.id]);

    const totalPoints = pointsRow ? pointsRow.total_points : 0;
    const targetPoints = user.target_points || 100;
    const performance = Math.round((totalPoints / targetPoints) * 100);

    logAudit(user.id, 'LOGIN', 'AUTH', user.id, `${user.name} logged in`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        target_points: targetPoints,
        total_points: totalPoints,
        performance_percentage: performance,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = queryOne(`
      SELECT u.id, u.name, u.email, u.designation, u.phone, u.avatar_url, u.target_points, u.created_at, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [req.user!.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Dynamic points
    const pointsRow = queryOne(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM points_transactions
      WHERE user_id = ?
    `, [user.id]);

    const totalPoints = pointsRow ? pointsRow.total_points : 0;
    const targetPoints = user.target_points || 100;
    const performance = Math.round((totalPoints / targetPoints) * 100);

    // Dynamic achievements
    const badges = queryOne(`
      SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?
    `, [user.id]);

    res.json({
      ...user,
      total_points: totalPoints,
      performance_percentage: performance,
      achievements_count: badges ? badges.count : 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = queryOne(`SELECT password_hash FROM users WHERE id = ?`, [req.user!.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    runQuery(`UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newHash, req.user!.id]);

    logAudit(req.user!.id, 'PASSWORD_CHANGE', 'USER', req.user!.id, `${req.user!.name} changed their password`);

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
