import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/analytics/admin - Full executive overview & analytics
router.get('/admin', authenticateToken, requireAdmin, (_req: Request, res: Response) => {
  try {
    // 1. Team Overview KPIs
    const membersRow = queryOne(`
      SELECT 
        COUNT(*) as total_members,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_members
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'team_member'
    `);

    const taskRow = queryOne(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status IN ('APPROVED', 'COMPLETED') THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as pending_approvals,
        SUM(CASE WHEN status = 'APPROVED' AND date(approved_at) = date('now') THEN 1 ELSE 0 END) as completed_today,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_tasks
      FROM tasks
    `);

    const clientRow = queryOne(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_clients
      FROM clients
    `);

    const leadRow = queryOne(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN stage NOT IN ('WON', 'LOST') THEN 1 ELSE 0 END) as active_leads,
        SUM(CASE WHEN stage = 'WON' THEN 1 ELSE 0 END) as won_leads,
        SUM(CASE WHEN stage = 'LOST' THEN 1 ELSE 0 END) as lost_leads,
        SUM(CASE WHEN stage NOT IN ('WON', 'LOST') THEN budget ELSE 0 END) as pipeline_value
      FROM leads
    `);

    const projectRow = queryOne(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(budget) as total_budget
      FROM projects
    `);

    // 2. Performance & Productivity by member
    const memberProductivity = queryAll(`
      SELECT 
        u.id, u.name, u.designation, u.target_points,
        (SELECT COALESCE(SUM(points), 0) FROM points_transactions pt WHERE pt.user_id = u.id) as total_points,
        (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to_id = u.id AND t.status IN ('APPROVED', 'COMPLETED')) as completed_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to_id = u.id AND t.status IN ('TO_DO', 'IN_PROGRESS', 'SUBMITTED')) as pending_tasks,
        (SELECT COUNT(*) FROM work_reports wr WHERE wr.user_id = u.id AND wr.status = 'APPROVED') as approved_reports
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'team_member' AND u.is_active = 1
      ORDER BY total_points DESC
    `).map(m => {
      const target = m.target_points || 100;
      const perf = Math.round((m.total_points / target) * 100);
      return {
        ...m,
        performance_percentage: perf,
      };
    });

    // 3. Lead Source Breakdown
    const leadSources = queryAll(`
      SELECT source, COUNT(*) as count, SUM(budget) as total_value
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `);

    // 4. Tasks Status Distribution
    const taskStatusDistribution = queryAll(`
      SELECT status, COUNT(*) as count
      FROM tasks
      GROUP BY status
    `);

    // 5. Weekly Productivity (last 7 days point distribution simulation from transactions)
    const weeklyProductivity = queryAll(`
      SELECT 
        date(created_at) as log_date,
        SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as points_earned,
        COUNT(*) as transaction_count
      FROM points_transactions
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY log_date ASC
    `);

    // 6. Project status distribution
    const projectDistribution = queryAll(`
      SELECT status, COUNT(*) as count, SUM(budget) as total_budget
      FROM projects
      GROUP BY status
    `);

    // 7. Recent activity stream (last 10 events)
    const recentActivity = queryAll(`
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    // Approval / Rejection rates
    const totalDecided = (taskRow?.completed_tasks || 0) + (taskRow?.rejected_tasks || 0);
    const approvalRate = totalDecided > 0 ? Math.round(((taskRow?.completed_tasks || 0) / totalDecided) * 100) : 100;
    const rejectionRate = totalDecided > 0 ? Math.round(((taskRow?.rejected_tasks || 0) / totalDecided) * 100) : 0;

    res.json({
      kpis: {
        total_members: membersRow?.total_members || 0,
        active_members: membersRow?.active_members || 0,
        total_tasks: taskRow?.total_tasks || 0,
        completed_today: taskRow?.completed_today || 0,
        pending_approvals: taskRow?.pending_approvals || 0,
        active_clients: clientRow?.active_clients || 0,
        total_clients: clientRow?.total_clients || 0,
        active_leads: leadRow?.active_leads || 0,
        pipeline_value: leadRow?.pipeline_value || 0,
        active_projects: projectRow?.active_projects || 0,
        completed_projects: projectRow?.completed_projects || 0,
        approval_rate: approvalRate,
        rejection_rate: rejectionRate,
      },
      member_productivity: memberProductivity,
      lead_sources: leadSources,
      task_status_distribution: taskStatusDistribution,
      project_distribution: projectDistribution,
      weekly_productivity: weeklyProductivity,
      recent_activity: recentActivity,
    });
  } catch (err: any) {
    console.error('Analytics computation error:', err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

export default router;
