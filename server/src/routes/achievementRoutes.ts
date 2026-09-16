import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit, createNotification } from '../middleware/auth';

const router = Router();

// GET /api/achievements - List all badges
router.get('/', authenticateToken, (_req: Request, res: Response) => {
  try {
    const badges = queryAll(`SELECT * FROM achievements ORDER BY points_reward DESC`);
    res.json(badges);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// GET /api/achievements/user/:userId - Badges earned by user
router.get('/user/:userId', authenticateToken, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const badges = queryAll(`
      SELECT 
        a.*,
        ua.id as user_achievement_id,
        ua.awarded_at,
        ua.awarded_reason,
        admin.name as awarded_by_name
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      LEFT JOIN users admin ON ua.awarded_by_id = admin.id
      WHERE ua.user_id = ?
      ORDER BY ua.awarded_at DESC
    `, [userId]);

    res.json(badges);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// POST /api/achievements/award - Admin awards badge to user
router.post('/award', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { user_id, achievement_id, reason } = req.body;

    if (!user_id || !achievement_id) {
      return res.status(400).json({ error: 'User ID and Achievement ID are required' });
    }

    const badge = queryOne(`SELECT title, points_reward FROM achievements WHERE id = ?`, [achievement_id]);
    if (!badge) return res.status(404).json({ error: 'Achievement badge not found' });

    const user = queryOne(`SELECT name FROM users WHERE id = ?`, [user_id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if already awarded
    const existing = queryOne(
      `SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?`,
      [user_id, achievement_id]
    );
    if (existing) {
      return res.status(400).json({ error: 'User already holds this badge' });
    }

    const uaId = uuidv4();
    runQuery(`
      INSERT INTO user_achievements (id, user_id, achievement_id, awarded_by_id, awarded_reason)
      VALUES (?, ?, ?, ?, ?)
    `, [uaId, user_id, achievement_id, req.user!.id, reason || 'Outstanding performance & dedication']);

    // Award bonus points associated with badge if any
    if (badge.points_reward && badge.points_reward > 0) {
      runQuery(`
        INSERT INTO points_transactions (id, user_id, points, reason, admin_id)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), user_id, badge.points_reward, `Badge Unlocked: ${badge.title} (+${badge.points_reward})`, req.user!.id]);
    }

    logAudit(req.user!.id, 'AWARD_BADGE', 'ACHIEVEMENT', uaId, `Admin ${req.user!.name} awarded badge "${badge.title}" to ${user.name}`);
    createNotification(
      user_id,
      `🏆 Badge Unlocked: ${badge.title}!`,
      `You were awarded the "${badge.title}" badge by ${req.user!.name}! ${badge.points_reward ? `+${badge.points_reward} points awarded.` : ''}`,
      'POINTS'
    );

    res.status(201).json({ message: `Successfully awarded badge "${badge.title}" to ${user.name}!` });
  } catch (err: any) {
    console.error('Award badge error:', err);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

export default router;
