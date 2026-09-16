import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit } from '../middleware/auth';

const router = Router();

// GET /api/users - List all users with calculated performance metrics
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const users = queryAll(`
      SELECT 
        u.id, u.name, u.email, u.designation, u.phone, u.avatar_url, 
        u.is_active, u.target_points, u.created_at,
        r.name as role, r.id as role_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY r.name ASC, u.name ASC
    `);

    // Enrich each user with real-time dynamic stats
    const enrichedUsers = users.map(user => {
      // 1. Points
      const pointsRow = queryOne(`
        SELECT COALESCE(SUM(points), 0) as total_points
        FROM points_transactions
        WHERE user_id = ?
      `, [user.id]);
      const totalPoints = pointsRow ? pointsRow.total_points : 0;
      const targetPoints = user.target_points || 100;
      const performance = Math.round((totalPoints / targetPoints) * 100);

      // Performance Level Label
      let performanceLevel = 'Needs Improvement';
      if (performance >= 90) performanceLevel = 'Outstanding';
      else if (performance >= 75) performanceLevel = 'Very Good';
      else if (performance >= 60) performanceLevel = 'Good';
      else if (performance >= 40) performanceLevel = 'Developing';

      // 2. Tasks stats
      const taskStats = queryOne(`
        SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status IN ('APPROVED', 'COMPLETED') THEN 1 ELSE 0 END) as completed_tasks,
          SUM(CASE WHEN status IN ('TO_DO', 'IN_PROGRESS', 'SUBMITTED', 'REJECTED') THEN 1 ELSE 0 END) as pending_tasks,
          SUM(CASE WHEN status = 'APPROVED' AND approved_at <= deadline THEN 1 ELSE 0 END) as on_time_completed
        FROM tasks
        WHERE assigned_to_id = ?
      `, [user.id]);

      const completed = taskStats ? taskStats.completed_tasks : 0;
      const pending = taskStats ? taskStats.pending_tasks : 0;
      const onTime = taskStats && completed > 0 
        ? Math.round(((taskStats.on_time_completed || completed) / completed) * 100)
        : 100;

      // 3. Badges
      const badges = queryAll(`
        SELECT a.id, a.code, a.title, a.icon_name, ua.awarded_at
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
      `, [user.id]);

      return {
        ...user,
        total_points: totalPoints,
        performance_percentage: performance,
        performance_level: performanceLevel,
        completed_tasks: completed,
        pending_tasks: pending,
        on_time_rate: onTime,
        badges,
      };
    });

    res.json(enrichedUsers);
  } catch (err: any) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/users/:id - Detailed member profile
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = queryOne(`
      SELECT 
        u.id, u.name, u.email, u.designation, u.phone, u.avatar_url, 
        u.is_active, u.target_points, u.created_at,
        r.name as role, r.id as role_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    if (!user) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Points
    const pointsRow = queryOne(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM points_transactions
      WHERE user_id = ?
    `, [id]);
    const totalPoints = pointsRow ? pointsRow.total_points : 0;
    const targetPoints = user.target_points || 100;
    const performance = Math.round((totalPoints / targetPoints) * 100);

    // Badges
    const badges = queryAll(`
      SELECT a.id, a.code, a.title, a.description, a.icon_name, ua.awarded_at, ua.awarded_reason,
             admin.name as awarded_by_name
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      LEFT JOIN users admin ON ua.awarded_by_id = admin.id
      WHERE ua.user_id = ?
    `, [id]);

    // Tasks
    const tasks = queryAll(`
      SELECT t.*, c.company_name as client_name, p.project_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to_id = ?
      ORDER BY t.created_at DESC
      LIMIT 20
    `, [id]);

    // Daily Reports
    const reports = queryAll(`
      SELECT r.*, c.company_name as client_name, t.title as task_title
      FROM work_reports r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN tasks t ON r.task_id = t.id
      WHERE r.user_id = ?
      ORDER BY r.report_date DESC
      LIMIT 15
    `, [id]);

    // Point Transactions history
    const transactions = queryAll(`
      SELECT pt.*, u.name as admin_name
      FROM points_transactions pt
      LEFT JOIN users u ON pt.admin_id = u.id
      WHERE pt.user_id = ?
      ORDER BY pt.created_at DESC
      LIMIT 30
    `, [id]);

    // Recent activity history
    const activity = queryAll(`
      SELECT * FROM audit_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [id]);

    res.json({
      ...user,
      total_points: totalPoints,
      performance_percentage: performance,
      badges,
      tasks,
      reports,
      transactions,
      activity,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch member profile' });
  }
});

// POST /api/users - Create new team member (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, designation, phone, target_points } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = queryOne(`SELECT id FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Lookup role id
    const roleRecord = queryOne(`SELECT id FROM roles WHERE name = ?`, [role || 'team_member']);
    if (!roleRecord) {
      return res.status(400).json({ error: 'Specified role is invalid' });
    }

    const newId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    runQuery(`
      INSERT INTO users (id, role_id, name, email, password_hash, designation, phone, is_active, target_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [newId, roleRecord.id, name.trim(), email.trim().toLowerCase(), passwordHash, designation || 'Team Member', phone || '', target_points || 100]);

    logAudit(req.user!.id, 'CREATE', 'USER', newId, `Admin ${req.user!.name} created user ${name} (${email})`);

    res.status(201).json({ message: 'Team member created successfully', id: newId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT /api/users/:id - Edit team member (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, designation, phone, role, target_points, is_active } = req.body;

    const user = queryOne(`SELECT id FROM users WHERE id = ?`, [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let roleIdParam = null;
    if (role) {
      const roleRec = queryOne(`SELECT id FROM roles WHERE name = ?`, [role]);
      if (roleRec) roleIdParam = roleRec.id;
    }

    runQuery(`
      UPDATE users
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          designation = COALESCE(?, designation),
          phone = COALESCE(?, phone),
          role_id = COALESCE(?, role_id),
          target_points = COALESCE(?, target_points),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, email, designation, phone, roleIdParam, target_points, is_active, id]);

    logAudit(req.user!.id, 'UPDATE', 'USER', id, `Admin ${req.user!.name} updated profile for user ${name || id}`);

    res.json({ message: 'User updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// PATCH /api/users/:id/toggle-status - Activate/Deactivate member (Admin only)
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = queryOne(`SELECT id, is_active, name FROM users WHERE id = ?`, [id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newStatus = user.is_active === 1 ? 0 : 1;
    runQuery(`UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newStatus, id]);

    const statusText = newStatus === 1 ? 'activated' : 'deactivated';
    logAudit(req.user!.id, 'STATUS_CHANGE', 'USER', id, `Admin ${req.user!.name} ${statusText} user ${user.name}`);

    res.json({ message: `User account ${statusText}`, is_active: newStatus });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

// POST /api/users/:id/reset-password - Admin resets member password
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = queryOne(`SELECT id, name FROM users WHERE id = ?`, [id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newHash = await bcrypt.hash(newPassword, 10);
    runQuery(`UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newHash, id]);

    logAudit(req.user!.id, 'PASSWORD_RESET', 'USER', id, `Admin ${req.user!.name} reset password for ${user.name}`);

    res.json({ message: `Password reset successfully for ${user.name}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
