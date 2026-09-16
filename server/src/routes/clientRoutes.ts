import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, requireAdmin, logAudit } from '../middleware/auth';

const router = Router();

// GET /api/clients - List all clients
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    let sql = `
      SELECT 
        c.*,
        u.name as assigned_member_name,
        u.email as assigned_member_email,
        (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) as total_projects,
        (SELECT COUNT(*) FROM tasks t WHERE t.client_id = c.id) as total_tasks
      FROM clients c
      LEFT JOIN users u ON c.assigned_member_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (LOWER(c.company_name) LIKE ? OR LOWER(c.contact_person) LIKE ? OR LOWER(c.industry) LIKE ?)`;
      const queryStr = `%${(search as string).toLowerCase()}%`;
      params.push(queryStr, queryStr, queryStr);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const clients = queryAll(sql, params);
    res.json(clients);
  } catch (err: any) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET /api/clients/:id - Client details with projects, tasks, activity
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = queryOne(`
      SELECT 
        c.*,
        u.name as assigned_member_name,
        u.email as assigned_member_email
      FROM clients c
      LEFT JOIN users u ON c.assigned_member_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Projects for this client
    const projects = queryAll(`
      SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC
    `, [id]);

    // Tasks for this client
    const tasks = queryAll(`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to_id = u.id
      WHERE t.client_id = ?
      ORDER BY t.created_at DESC
    `, [id]);

    // Work reports associated with this client
    const reports = queryAll(`
      SELECT r.*, u.name as user_name
      FROM work_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.client_id = ?
      ORDER BY r.report_date DESC
      LIMIT 10
    `, [id]);

    res.json({
      ...client,
      projects,
      tasks,
      reports,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch client details' });
  }
});

// POST /api/clients - Create client (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      company_name,
      contact_person,
      phone,
      email,
      location,
      industry,
      service,
      budget,
      assigned_member_id,
      status,
      source,
      notes,
      next_follow_up,
    } = req.body;

    if (!company_name || !contact_person) {
      return res.status(400).json({ error: 'Company name and contact person are required' });
    }

    const clientId = uuidv4();
    runQuery(`
      INSERT INTO clients (
        id, company_name, contact_person, phone, email, location, industry,
        service, budget, assigned_member_id, status, source, notes, next_follow_up
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientId,
      company_name.trim(),
      contact_person.trim(),
      phone || '',
      email || '',
      location || '',
      industry || '',
      service || '',
      budget || 0,
      assigned_member_id || null,
      status || 'Active',
      source || 'Website',
      notes || '',
      next_follow_up || null,
    ]);

    logAudit(req.user!.id, 'CREATE', 'CLIENT', clientId, `Admin ${req.user!.name} created client "${company_name}"`);

    res.status(201).json({ message: 'Client created successfully', id: clientId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id - Edit client
router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      contact_person,
      phone,
      email,
      location,
      industry,
      service,
      budget,
      assigned_member_id,
      status,
      source,
      notes,
      next_follow_up,
    } = req.body;

    runQuery(`
      UPDATE clients SET
        company_name = COALESCE(?, company_name),
        contact_person = COALESCE(?, contact_person),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        location = COALESCE(?, location),
        industry = COALESCE(?, industry),
        service = COALESCE(?, service),
        budget = COALESCE(?, budget),
        assigned_member_id = COALESCE(?, assigned_member_id),
        status = COALESCE(?, status),
        source = COALESCE(?, source),
        notes = COALESCE(?, notes),
        next_follow_up = COALESCE(?, next_follow_up),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      company_name, contact_person, phone, email, location, industry, service,
      budget, assigned_member_id, status, source, notes, next_follow_up, id
    ]);

    logAudit(req.user!.id, 'UPDATE', 'CLIENT', id, `Admin ${req.user!.name} updated client "${company_name || id}"`);

    res.json({ message: 'Client updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Delete client (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = queryOne(`SELECT company_name FROM clients WHERE id = ?`, [id]);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    runQuery(`DELETE FROM clients WHERE id = ?`, [id]);
    logAudit(req.user!.id, 'DELETE', 'CLIENT', id, `Admin ${req.user!.name} deleted client "${client.company_name}"`);

    res.json({ message: 'Client deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
