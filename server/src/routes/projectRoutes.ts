import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit } from '../middleware/auth';

const router = Router();

// GET /api/projects - List projects
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const { status, client_id } = req.query;

    let sql = `
      SELECT 
        p.*,
        c.company_name as client_name,
        c.contact_person as client_contact,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status IN ('APPROVED', 'COMPLETED')) as completed_tasks
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }
    if (client_id) {
      sql += ` AND p.client_id = ?`;
      params.push(client_id);
    }

    sql += ` ORDER BY p.created_at DESC`;

    const projects = queryAll(sql, params);

    // Fetch team members for each project
    const enriched = projects.map(proj => {
      const members = queryAll(`
        SELECT pm.id as membership_id, pm.role_in_project, u.id as user_id, u.name, u.email, u.avatar_url, u.designation
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
      `, [proj.id]);

      return {
        ...proj,
        members,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Project details with tasks and members
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = queryOne(`
      SELECT 
        p.*,
        c.company_name as client_name,
        c.contact_person as client_contact,
        c.phone as client_phone,
        c.email as client_email
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const members = queryAll(`
      SELECT pm.id as membership_id, pm.role_in_project, u.id as user_id, u.name, u.email, u.avatar_url, u.designation
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [id]);

    const tasks = queryAll(`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to_id = u.id
      WHERE t.project_id = ?
      ORDER BY t.created_at DESC
    `, [id]);

    res.json({
      ...project,
      members,
      tasks,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// POST /api/projects - Create project (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      client_id,
      project_name,
      description,
      budget,
      start_date,
      deadline,
      status,
      member_ids,
    } = req.body;

    if (!client_id || !project_name) {
      return res.status(400).json({ error: 'Client and Project name are required' });
    }

    const projectId = uuidv4();
    runQuery(`
      INSERT INTO projects (
        id, client_id, project_name, description, budget, start_date, deadline, status, progress_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      projectId,
      client_id,
      project_name.trim(),
      description || '',
      budget || 0,
      start_date || null,
      deadline || null,
      status || 'In Progress',
    ]);

    // Add members
    if (member_ids && Array.isArray(member_ids)) {
      for (const uid of member_ids) {
        runQuery(`
          INSERT INTO project_members (id, project_id, user_id, role_in_project)
          VALUES (?, ?, ?, 'Contributor')
        `, [uuidv4(), projectId, uid]);
      }
    }

    logAudit(req.user!.id, 'CREATE', 'PROJECT', projectId, `Admin ${req.user!.name} created project "${project_name}"`);

    res.status(201).json({ message: 'Project created successfully', id: projectId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Edit project (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      project_name,
      description,
      budget,
      start_date,
      deadline,
      status,
      progress_percentage,
      member_ids,
    } = req.body;

    runQuery(`
      UPDATE projects SET
        client_id = COALESCE(?, client_id),
        project_name = COALESCE(?, project_name),
        description = COALESCE(?, description),
        budget = COALESCE(?, budget),
        start_date = COALESCE(?, start_date),
        deadline = COALESCE(?, deadline),
        status = COALESCE(?, status),
        progress_percentage = COALESCE(?, progress_percentage),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      client_id, project_name, description, budget, start_date,
      deadline, status, progress_percentage, id
    ]);

    // If member_ids passed, sync members
    if (member_ids && Array.isArray(member_ids)) {
      runQuery(`DELETE FROM project_members WHERE project_id = ?`, [id]);
      for (const uid of member_ids) {
        runQuery(`
          INSERT INTO project_members (id, project_id, user_id, role_in_project)
          VALUES (?, ?, ?, 'Contributor')
        `, [uuidv4(), id, uid]);
      }
    }

    logAudit(req.user!.id, 'UPDATE', 'PROJECT', id, `Admin ${req.user!.name} updated project`);

    res.json({ message: 'Project updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    runQuery(`DELETE FROM projects WHERE id = ?`, [id]);
    logAudit(req.user!.id, 'DELETE', 'PROJECT', id, `Admin ${req.user!.name} deleted project`);
    res.json({ message: 'Project deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
