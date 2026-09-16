import { Router, Request, Response } from 'express';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/notifications - List notifications for logged-in user
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const notifications = queryAll(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user!.id]);

    const unreadCountRow = queryOne(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `, [req.user!.id]);

    res.json({
      notifications,
      unread_count: unreadCountRow ? unreadCountRow.count : 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    runQuery(`
      UPDATE notifications SET is_read = 1
      WHERE id = ? AND user_id = ?
    `, [id, req.user!.id]);

    res.json({ message: 'Marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', authenticateToken, (req: Request, res: Response) => {
  try {
    runQuery(`
      UPDATE notifications SET is_read = 1
      WHERE user_id = ?
    `, [req.user!.id]);

    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

export default router;
