import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runQuery } from '../database';
import { authenticateToken, logAudit, createNotification } from '../middleware/auth';

const router = Router();

// GET /api/leads - List leads with pipeline statistics
router.get('/', authenticateToken, (_req: Request, res: Response) => {
  try {
    const leads = queryAll(`
      SELECT 
        l.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM leads l
      LEFT JOIN users u ON l.assigned_to_id = u.id
      ORDER BY l.created_at DESC
    `);

    // Pipeline metrics
    const statsRow = queryOne(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN stage = 'NEW_LEAD' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN stage = 'CONTACTED' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN stage = 'INTERESTED' THEN 1 ELSE 0 END) as interested,
        SUM(CASE WHEN stage = 'MEETING' THEN 1 ELSE 0 END) as meetings,
        SUM(CASE WHEN stage = 'PROPOSAL_SENT' THEN 1 ELSE 0 END) as proposals,
        SUM(CASE WHEN stage = 'NEGOTIATION' THEN 1 ELSE 0 END) as negotiation,
        SUM(CASE WHEN stage = 'WON' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN stage = 'LOST' THEN 1 ELSE 0 END) as lost,
        SUM(CASE WHEN stage NOT IN ('WON', 'LOST') THEN budget ELSE 0 END) as pipeline_value,
        SUM(CASE WHEN stage = 'WON' THEN budget ELSE 0 END) as won_value
      FROM leads
    `);

    const total = statsRow ? statsRow.total_leads : 0;
    const won = statsRow ? statsRow.won : 0;
    const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

    res.json({
      leads,
      metrics: {
        total_leads: total,
        new_leads: statsRow ? statsRow.new_leads : 0,
        contacted: statsRow ? statsRow.contacted : 0,
        interested: statsRow ? statsRow.interested : 0,
        meetings: statsRow ? statsRow.meetings : 0,
        proposals: statsRow ? statsRow.proposals : 0,
        negotiation: statsRow ? statsRow.negotiation : 0,
        won: won,
        lost: statsRow ? statsRow.lost : 0,
        pipeline_value: statsRow ? statsRow.pipeline_value : 0,
        won_value: statsRow ? statsRow.won_value : 0,
        conversion_rate: conversionRate,
      },
    });
  } catch (err: any) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST /api/leads - Create lead
router.post('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const {
      name,
      company,
      phone,
      email,
      source,
      industry,
      interested_service,
      budget,
      assigned_to_id,
      stage,
      follow_up_date,
      notes,
    } = req.body;

    if (!name || !company) {
      return res.status(400).json({ error: 'Lead contact name and company name are required' });
    }

    const leadId = uuidv4();
    runQuery(`
      INSERT INTO leads (
        id, name, company, phone, email, source, industry,
        interested_service, budget, assigned_to_id, stage, follow_up_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      leadId,
      name.trim(),
      company.trim(),
      phone || '',
      email || '',
      source || 'Website',
      industry || '',
      interested_service || '',
      budget || 0,
      assigned_to_id || req.user!.id,
      stage || 'NEW_LEAD',
      follow_up_date || null,
      notes || '',
    ]);

    logAudit(req.user!.id, 'CREATE', 'LEAD', leadId, `${req.user!.name} created lead "${company}" (${name})`);

    if (assigned_to_id && assigned_to_id !== req.user!.id) {
      createNotification(assigned_to_id, 'New Lead Assigned', `New lead assigned to you: ${company} (${name})`, 'LEAD', '/leads');
    }

    res.status(201).json({ message: 'Lead created successfully', id: leadId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// PATCH /api/leads/:id/stage - Transition lead stage (Kanban drag & drop)
router.patch('/:id/stage', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const validStages = ['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'MEETING', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid pipeline stage' });
    }

    const lead = queryOne(`SELECT name, company, budget, assigned_to_id FROM leads WHERE id = ?`, [id]);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    runQuery(`
      UPDATE leads SET
        stage = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [stage, id]);

    logAudit(req.user!.id, 'STAGE_CHANGE', 'LEAD', id, `${req.user!.name} moved lead "${lead.company}" to ${stage}`);

    if (stage === 'WON') {
      // Notify admins
      const admins = queryAll(`SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'admin'`);
      for (const a of admins) {
        createNotification(a.id, '🎉 Lead Won!', `Lead "${lead.company}" was marked as WON ($${lead.budget})!`, 'LEAD', '/leads');
      }
    }

    res.json({ message: `Lead moved to ${stage}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
});

// POST /api/leads/:id/convert-to-client - Convert WON lead to active Client
router.post('/:id/convert-to-client', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = queryOne(`SELECT * FROM leads WHERE id = ?`, [id]);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const clientId = uuidv4();
    runQuery(`
      INSERT INTO clients (
        id, company_name, contact_person, phone, email, location, industry,
        service, budget, assigned_member_id, status, source, notes
      ) VALUES (?, ?, ?, ?, ?, '', ?, ?, ?, ?, 'Active', ?, ?)
    `, [
      clientId,
      lead.company,
      lead.name,
      lead.phone,
      lead.email,
      lead.industry,
      lead.interested_service,
      lead.budget,
      lead.assigned_to_id,
      lead.source,
      `Converted from Lead CRM: ${lead.notes || ''}`
    ]);

    // Update lead stage to WON if not already
    runQuery(`UPDATE leads SET stage = 'WON', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);

    logAudit(req.user!.id, 'CONVERT', 'CLIENT', clientId, `Converted lead "${lead.company}" into active Client`);

    res.status(201).json({ message: `Lead successfully converted to Client!`, client_id: clientId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to convert lead to client' });
  }
});

// PUT /api/leads/:id - Edit lead
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      company,
      phone,
      email,
      source,
      industry,
      interested_service,
      budget,
      assigned_to_id,
      stage,
      follow_up_date,
      notes,
    } = req.body;

    runQuery(`
      UPDATE leads SET
        name = COALESCE(?, name),
        company = COALESCE(?, company),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        source = COALESCE(?, source),
        industry = COALESCE(?, industry),
        interested_service = COALESCE(?, interested_service),
        budget = COALESCE(?, budget),
        assigned_to_id = COALESCE(?, assigned_to_id),
        stage = COALESCE(?, stage),
        follow_up_date = COALESCE(?, follow_up_date),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, company, phone, email, source, industry, interested_service,
      budget, assigned_to_id, stage, follow_up_date, notes, id
    ]);

    res.json({ message: 'Lead updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    runQuery(`DELETE FROM leads WHERE id = ?`, [id]);
    res.json({ message: 'Lead deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;
