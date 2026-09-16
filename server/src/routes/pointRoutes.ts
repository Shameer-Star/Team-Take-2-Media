import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit, createNotification } from '../middleware/auth';

const router = Router();

// GET /api/points/rules - List point rules
router.get('/rules', authenticateToken, (_req: Request, res: Response) => {
  try {
    const rules = queryAll(`SELECT * FROM point_rules ORDER BY points_delta DESC`);
    res.json(rules);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch point rules' });
  }
});

// PUT /api/points/rules/:id - Update point rule (Admin only)
router.put('/rules/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, points_delta, is_active } = req.body;

    runQuery(`
      UPDATE point_rules SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        points_delta = COALESCE(?, points_delta),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, points_delta, is_active, id]);

    logAudit(req.user!.id, 'UPDATE', 'POINT_RULE', id, `Admin ${req.user!.name} updated point rule`);
    res.json({ message: 'Point rule updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update point rule' });
  }
});

// GET /api/points/transactions - Point history
router.get('/transactions', authenticateToken, (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    let sql = `
      SELECT 
        pt.*,
        u.name as user_name,
        u.email as user_email,
        admin.name as admin_name
      FROM points_transactions pt
      JOIN users u ON pt.user_id = u.id
      LEFT JOIN users admin ON pt.admin_id = admin.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user!.role !== 'admin') {
      sql += ` AND pt.user_id = ?`;
      params.push(req.user!.id);
    } else if (user_id) {
      sql += ` AND pt.user_id = ?`;
      params.push(user_id);
    }

    sql += ` ORDER BY pt.created_at DESC LIMIT 100`;

    const transactions = queryAll(sql, params);
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/points/manual - Admin grants or deducts manual points
router.post('/manual', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { user_id, points, reason, task_id } = req.body;

    if (!user_id || points === undefined || !reason) {
      return res.status(400).json({ error: 'User ID, points, and reason are required' });
    }

    const targetUser = queryOne(`SELECT name FROM users WHERE id = ?`, [user_id]);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const pointsNum = parseInt(points, 10);
    const txId = uuidv4();

    runQuery(`
      INSERT INTO points_transactions (id, user_id, points, reason, task_id, admin_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [txId, user_id, pointsNum, reason.trim(), task_id || null, req.user!.id]);

    const prefix = pointsNum >= 0 ? `+${pointsNum}` : `${pointsNum}`;
    logAudit(req.user!.id, 'POINTS_ADJUST', 'USER', user_id, `Admin ${req.user!.name} awarded ${prefix} points to ${targetUser.name}: "${reason}"`);
    createNotification(
      user_id,
      pointsNum >= 0 ? 'Points Awarded! 🌟' : 'Points Deducted',
      `Admin ${req.user!.name} adjusted your balance by ${prefix} points: "${reason}"`,
      'POINTS'
    );

    res.status(201).json({ message: `Successfully logged point transaction of ${prefix} points` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record manual point transaction' });
  }
});

// GET /api/points/leaderboard - Real-time computed team leaderboard
router.get('/leaderboard', authenticateToken, (_req: Request, res: Response) => {
  try {
    const users = queryAll(`
      SELECT 
        u.id, u.name, u.email, u.designation, u.avatar_url, u.target_points,
        r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.is_active = 1
    `);

    const leaderboard = users.map(u => {
      // Points total
      const pointsRow = queryOne(`
        SELECT COALESCE(SUM(points), 0) as total_points
        FROM points_transactions
        WHERE user_id = ?
      `, [u.id]);
      const totalPoints = pointsRow ? pointsRow.total_points : 0;
      const targetPoints = u.target_points || 100;
      const performance = Math.round((totalPoints / targetPoints) * 100);

      // Performance Level
      let performanceLevel = 'Needs Improvement';
      if (performance >= 90) performanceLevel = 'Outstanding';
      else if (performance >= 75) performanceLevel = 'Very Good';
      else if (performance >= 60) performanceLevel = 'Good';
      else if (performance >= 40) performanceLevel = 'Developing';

      // Completed tasks
      const taskRow = queryOne(`
        SELECT COUNT(*) as completed
        FROM tasks
        WHERE assigned_to_id = ? AND status IN ('APPROVED', 'COMPLETED')
      `, [u.id]);

      // Badges
      const badges = queryAll(`
        SELECT a.id, a.code, a.title, a.icon_name
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
      `, [u.id]);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        designation: u.designation,
        role: u.role,
        points: totalPoints,
        target_points: targetPoints,
        performance_percentage: performance,
        performance_level: performanceLevel,
        tasks_completed: taskRow ? taskRow.completed : 0,
        achievements: badges,
      };
    });

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    // Assign dynamic ranks
    const ranked = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    res.json(ranked);
  } catch (err: any) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to generate leaderboard' });
  }
});

export default router;
