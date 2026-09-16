import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit, createNotification } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /api/reports - List daily work reports
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const { status, user_id, date } = req.query;

    let sql = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        u.designation as user_designation,
        c.company_name as client_name,
        t.title as task_title,
        reviewer.name as reviewer_name
      FROM work_reports r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN tasks t ON r.task_id = t.id
      LEFT JOIN users reviewer ON r.reviewed_by_id = reviewer.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Team members see own reports only
    if (req.user!.role !== 'admin') {
      sql += ` AND r.user_id = ?`;
      params.push(req.user!.id);
    } else if (user_id) {
      sql += ` AND r.user_id = ?`;
      params.push(user_id);
    }

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (date) {
      sql += ` AND r.report_date = ?`;
      params.push(date);
    }

    sql += ` ORDER BY r.report_date DESC, r.created_at DESC`;

    const reports = queryAll(sql, params);

    // Attach any proof attachments
    const enriched = reports.map(rep => {
      const attachments = queryAll(
        `SELECT * FROM work_report_attachments WHERE report_id = ?`,
        [rep.id]
      );
      return { ...rep, attachments };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch work reports' });
  }
});

// POST /api/reports - Submit daily work report
router.post('/', authenticateToken, upload.array('attachments', 5), (req: Request, res: Response) => {
  try {
    const {
      report_date,
      task_id,
      client_id,
      work_description,
      completed_items,
      implemented_items,
      hours_worked,
      progress_percentage,
      additional_notes,
    } = req.body;

    if (!work_description || !work_description.trim()) {
      return res.status(400).json({ error: 'Work description is required' });
    }

    const reportId = uuidv4();
    const dateToUse = report_date || new Date().toISOString().split('T')[0];

    runQuery(`
      INSERT INTO work_reports (
        id, user_id, task_id, client_id, report_date, work_description,
        completed_items, implemented_items, hours_worked, progress_percentage,
        additional_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL')
    `, [
      reportId,
      req.user!.id,
      task_id || null,
      client_id || null,
      dateToUse,
      work_description.trim(),
      completed_items || '',
      implemented_items || '',
      hours_worked || 0,
      progress_percentage || 0,
      additional_notes || '',
    ]);

    // Handle files if uploaded
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        runQuery(`
          INSERT INTO work_report_attachments (id, report_id, file_name, file_url, file_type, file_size)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          reportId,
          file.originalname,
          `/uploads/${file.filename}`,
          file.mimetype,
          file.size,
        ]);
      }
    }

    logAudit(req.user!.id, 'SUBMIT', 'REPORT', reportId, `${req.user!.name} submitted daily work report for ${dateToUse}`);

    // Notify admins
    const admins = queryAll(`SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'admin'`);
    for (const a of admins) {
      createNotification(a.id, 'Daily Report Submitted', `${req.user!.name} submitted a daily work report for review.`, 'REPORT', `/reports`);
    }

    res.status(201).json({
      message: 'Daily work report submitted successfully and is pending approval!',
      id: reportId,
    });
  } catch (err: any) {
    console.error('Report submission error:', err);
    res.status(500).json({ error: 'Failed to submit daily report' });
  }
});

// POST /api/reports/:id/approve - Admin approves daily report
router.post('/:id/approve', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = queryOne(`SELECT * FROM work_reports WHERE id = ?`, [id]);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    runQuery(`
      UPDATE work_reports SET
        status = 'APPROVED',
        rejection_reason = NULL,
        reviewed_by_id = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.user!.id, id]);

    // Award +2 points for approved daily report
    const pointsAwarded = 2;
    runQuery(`
      INSERT INTO points_transactions (id, user_id, points, reason, report_id, admin_id)
      VALUES (?, ?, ?, 'Daily Report Approved (+2)', ?, ?)
    `, [uuidv4(), report.user_id, pointsAwarded, id, req.user!.id]);

    logAudit(req.user!.id, 'APPROVE', 'REPORT', id, `Admin ${req.user!.name} approved daily report for user`);
    createNotification(
      report.user_id,
      'Daily Report Approved! ⭐',
      `Your daily work report for ${report.report_date} was approved. You earned +${pointsAwarded} points.`,
      'POINTS',
      `/reports`
    );

    res.json({ message: 'Daily report approved! +2 points awarded.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve report' });
  }
});

// POST /api/reports/:id/reject - Admin rejects daily report with reason
router.post('/:id/reject', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const report = queryOne(`SELECT * FROM work_reports WHERE id = ?`, [id]);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    runQuery(`
      UPDATE work_reports SET
        status = 'REJECTED',
        rejection_reason = ?,
        reviewed_by_id = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [rejection_reason.trim(), req.user!.id, id]);

    logAudit(req.user!.id, 'REJECT', 'REPORT', id, `Admin ${req.user!.name} rejected daily report: ${rejection_reason}`);
    createNotification(
      report.user_id,
      'Daily Report Needs Revision',
      `Your daily report for ${report.report_date} was rejected: "${rejection_reason}". Please resubmit.`,
      'REPORT',
      `/reports`
    );

    res.json({ message: 'Daily report rejected' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject report' });
  }
});

export default router;
