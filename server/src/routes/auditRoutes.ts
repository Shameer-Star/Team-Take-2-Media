import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs - Query audit history (Admin only)
router.get('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { action, entity_type, user_id, limit = 50 } = req.query;

    let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (action) {
      sql += ` AND al.action = ?`;
      params.push(action);
    }
    if (entity_type) {
      sql += ` AND al.entity_type = ?`;
      params.push(entity_type);
    }
    if (user_id) {
      sql += ` AND al.user_id = ?`;
      params.push(user_id);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const logs = queryAll(sql, params);
    const countRow = queryOne(`SELECT COUNT(*) as total FROM audit_logs`);

    res.json({
      logs,
      total: countRow ? countRow.total : logs.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
