import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit, createNotification } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /api/tasks - List tasks
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const { status, priority, client_id, project_id, assigned_to_id } = req.query;

    let sql = `
      SELECT 
        t.*,
        c.company_name as client_name,
        p.project_name,
        assignee.name as assigned_to_name,
        assignee.email as assigned_to_email,
        creator.name as created_by_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assignee ON t.assigned_to_id = assignee.id
      LEFT JOIN users creator ON t.created_by_id = creator.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // If member, default to own tasks unless explicitly querying or viewing assigned
    if (req.user!.role !== 'admin') {
      sql += ` AND t.assigned_to_id = ?`;
      params.push(req.user!.id);
    } else if (assigned_to_id) {
      sql += ` AND t.assigned_to_id = ?`;
      params.push(assigned_to_id);
    }

    if (status) {
      sql += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (client_id) {
      sql += ` AND t.client_id = ?`;
      params.push(client_id);
    }
    if (project_id) {
      sql += ` AND t.project_id = ?`;
      params.push(project_id);
    }

    sql += ` ORDER BY 
      CASE t.priority 
        WHEN 'Urgent' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
      END ASC, 
      t.deadline ASC, 
      t.created_at DESC`;

    const tasks = queryAll(sql, params);
    res.json(tasks);
  } catch (err: any) {
    console.error('Error listing tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - Detailed single task
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = queryOne(`
      SELECT 
        t.*,
        c.company_name as client_name,
        p.project_name,
        assignee.name as assigned_to_name,
        assignee.email as assigned_to_email,
        creator.name as created_by_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assignee ON t.assigned_to_id = assignee.id
      LEFT JOIN users creator ON t.created_by_id = creator.id
      WHERE t.id = ?
    `, [id]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Role check: Team members can only view their own tasks
    if (req.user!.role !== 'admin' && task.assigned_to_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }

    // Fetch comments
    const comments = queryAll(`
      SELECT tc.*, u.name as user_name, u.avatar_url, r.name as user_role
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `, [id]);

    // Fetch attachments
    const attachments = queryAll(`
      SELECT ta.*, u.name as uploaded_by_name
      FROM task_attachments ta
      JOIN users u ON ta.uploaded_by_id = u.id
      WHERE ta.task_id = ?
      ORDER BY ta.created_at DESC
    `, [id]);

    res.json({
      ...task,
      comments,
      attachments,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch task details' });
  }
});

// POST /api/tasks - Create task (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      client_id,
      project_id,
      assigned_to_id,
      priority,
      deadline,
      estimated_hours,
      required_deliverables,
    } = req.body;

    if (!title || !assigned_to_id) {
      return res.status(400).json({ error: 'Task title and assigned team member are required' });
    }

    const taskId = uuidv4();
    runQuery(`
      INSERT INTO tasks (
        id, title, description, client_id, project_id, assigned_to_id, created_by_id,
        priority, deadline, estimated_hours, required_deliverables, status, progress_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'TO_DO', 0)
    `, [
      taskId,
      title.trim(),
      description || '',
      client_id || null,
      project_id || null,
      assigned_to_id,
      req.user!.id,
      priority || 'Medium',
      deadline || null,
      estimated_hours || 0,
      required_deliverables || '',
    ]);

    logAudit(req.user!.id, 'CREATE', 'TASK', taskId, `Admin ${req.user!.name} created task: "${title}"`);
    createNotification(assigned_to_id, 'New Task Assigned', `You have been assigned: "${title}"`, 'TASK', `/tasks/${taskId}`);

    res.status(201).json({ message: 'Task created successfully', id: taskId });
  } catch (err: any) {
    console.error('Task creation error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Edit task (Admin or assigned member updating status/progress)
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = queryOne(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user!.role !== 'admin' && task.assigned_to_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    // Admin can update all fields; team member can update progress and actual hours
    if (req.user!.role === 'admin') {
      const {
        title,
        description,
        client_id,
        project_id,
        assigned_to_id,
        priority,
        deadline,
        estimated_hours,
        actual_hours,
        required_deliverables,
        status,
        progress_percentage,
      } = req.body;

      runQuery(`
        UPDATE tasks SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          client_id = COALESCE(?, client_id),
          project_id = COALESCE(?, project_id),
          assigned_to_id = COALESCE(?, assigned_to_id),
          priority = COALESCE(?, priority),
          deadline = COALESCE(?, deadline),
          estimated_hours = COALESCE(?, estimated_hours),
          actual_hours = COALESCE(?, actual_hours),
          required_deliverables = COALESCE(?, required_deliverables),
          status = COALESCE(?, status),
          progress_percentage = COALESCE(?, progress_percentage),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        title, description, client_id, project_id, assigned_to_id, priority,
        deadline, estimated_hours, actual_hours, required_deliverables, status,
        progress_percentage, id
      ]);

      logAudit(req.user!.id, 'UPDATE', 'TASK', id, `Admin ${req.user!.name} edited task "${task.title}"`);
    } else {
      // Member partial update
      const { progress_percentage, actual_hours, status } = req.body;
      const allowedStatus = status === 'IN_PROGRESS' || status === 'TO_DO' ? status : task.status;

      runQuery(`
        UPDATE tasks SET
          progress_percentage = COALESCE(?, progress_percentage),
          actual_hours = COALESCE(?, actual_hours),
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [progress_percentage, actual_hours, allowedStatus, id]);
    }

    res.json({ message: 'Task updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST /api/tasks/:id/submit - Member submits work for approval
router.post('/:id/submit', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { submission_notes, actual_hours } = req.body;

    const task = queryOne(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user!.role !== 'admin' && task.assigned_to_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to submit this task' });
    }

    // Update status to SUBMITTED. Points NOT awarded yet!
    runQuery(`
      UPDATE tasks SET
        status = 'SUBMITTED',
        progress_percentage = 100,
        submission_notes = ?,
        actual_hours = COALESCE(?, actual_hours),
        submitted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [submission_notes || 'Deliverables submitted for review.', actual_hours, id]);

    logAudit(req.user!.id, 'SUBMIT', 'TASK', id, `${req.user!.name} submitted task: "${task.title}" for review`);

    // Notify all admins
    const admins = queryAll(`
      SELECT u.id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'admin'
    `);
    for (const admin of admins) {
      createNotification(admin.id, 'Task Awaiting Approval', `${req.user!.name} submitted "${task.title}" for review.`, 'TASK', `/tasks/${id}`);
    }

    res.json({ message: 'Task submitted for admin approval! Points will be awarded upon approval.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// POST /api/tasks/:id/approve - Admin approves task and awards points
router.post('/:id/approve', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = queryOne(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Mark task as APPROVED
    runQuery(`
      UPDATE tasks SET
        status = 'APPROVED',
        rejection_reason = NULL,
        approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    // Calculate points based on configurable rules:
    // Base: +10
    // Early delivery: +5 if approved before deadline
    // High / Urgent: +10
    let pointsToAward = 10;
    const reasons: string[] = ['Task completed (+10)'];

    if (task.deadline) {
      const now = new Date();
      const deadline = new Date(task.deadline);
      if (now <= deadline) {
        pointsToAward += 5;
        reasons.push('Early completion bonus (+5)');
      }
    }

    if (task.priority === 'High' || task.priority === 'Urgent') {
      pointsToAward += 10;
      reasons.push(`${task.priority} priority bonus (+10)`);
    }

    // Award points transaction
    const txId = uuidv4();
    runQuery(`
      INSERT INTO points_transactions (id, user_id, points, reason, task_id, admin_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [txId, task.assigned_to_id, pointsToAward, reasons.join(', '), id, req.user!.id]);

    logAudit(req.user!.id, 'APPROVE', 'TASK', id, `Admin ${req.user!.name} approved task: "${task.title}". Awarded +${pointsToAward} points.`);
    createNotification(
      task.assigned_to_id,
      'Task Approved! 🎉',
      `Your task "${task.title}" was approved! You earned +${pointsToAward} points.`,
      'POINTS',
      `/tasks/${id}`
    );

    res.json({
      message: `Task approved successfully! Awarded +${pointsToAward} points.`,
      points_awarded: pointsToAward,
    });
  } catch (err: any) {
    console.error('Task approval error:', err);
    res.status(500).json({ error: 'Failed to approve task' });
  }
});

// POST /api/tasks/:id/reject - Admin rejects task with mandatory reason
router.post('/:id/reject', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'A specific rejection reason is required' });
    }

    const task = queryOne(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Mark task as REJECTED
    runQuery(`
      UPDATE tasks SET
        status = 'REJECTED',
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [rejection_reason.trim(), id]);

    // Record rejection penalty (-3 points)
    const penalty = -3;
    runQuery(`
      INSERT INTO points_transactions (id, user_id, points, reason, task_id, admin_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [uuidv4(), task.assigned_to_id, penalty, `Rejected submission: "${task.title}" (-3)`, id, req.user!.id]);

    logAudit(req.user!.id, 'REJECT', 'TASK', id, `Admin ${req.user!.name} rejected task "${task.title}": ${rejection_reason}`);
    createNotification(
      task.assigned_to_id,
      'Task Requires Revision',
      `Your submission for "${task.title}" was rejected: "${rejection_reason}". Please update and resubmit.`,
      'TASK',
      `/tasks/${id}`
    );

    res.json({ message: 'Task rejected and returned for revision' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject task' });
  }
});

// DELETE /api/tasks/:id - Admin deletes task
router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = queryOne(`SELECT title FROM tasks WHERE id = ?`, [id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    runQuery(`DELETE FROM tasks WHERE id = ?`, [id]);
    logAudit(req.user!.id, 'DELETE', 'TASK', id, `Admin ${req.user!.name} deleted task "${task.title}"`);

    res.json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/tasks/:id/comments - Add comment to task
router.post('/:id/comments', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const commentId = uuidv4();
    runQuery(`
      INSERT INTO task_comments (id, task_id, user_id, comment)
      VALUES (?, ?, ?, ?)
    `, [commentId, id, req.user!.id, comment.trim()]);

    res.status(201).json({ message: 'Comment added', id: commentId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// POST /api/tasks/:id/attachments - Upload proof / file to task
router.post('/:id/attachments', authenticateToken, upload.single('file'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachmentId = uuidv4();

    runQuery(`
      INSERT INTO task_attachments (id, task_id, file_name, file_url, file_type, file_size, uploaded_by_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      attachmentId,
      id,
      req.file.originalname,
      fileUrl,
      req.file.mimetype,
      req.file.size,
      req.user!.id,
    ]);

    res.status(201).json({
      message: 'File attached successfully',
      file: {
        id: attachmentId,
        fileName: req.file.originalname,
        fileUrl,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

export default router;
