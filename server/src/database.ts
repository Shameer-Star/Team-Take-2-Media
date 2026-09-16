import initSqlJs, { Database, SqlValue } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DB_FILE = path.join(__dirname, '..', 'take_two_os.db');

let db: Database;

export interface QueryResult<T = any> {
  columns: string[];
  values: any[][];
}

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  // Create all 17 tables
  createTables();

  // Save initial database state
  saveDatabase();

  // Check if seed data is needed
  await seedInitialData();

  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const sanitized = params.map(p => (p === undefined ? null : p));
  const stmt = db.prepare(sql);
  stmt.bind(sanitized);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function runQuery(sql: string, params: any[] = []): { changes: number } {
  const sanitized = params.map(p => (p === undefined ? null : p));
  db.run(sql, sanitized);
  const changes = db.getRowsModified();
  saveDatabase();
  return { changes };
}

function createTables() {
  db.run(`
    -- 1. Roles
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      phone TEXT,
      designation TEXT,
      is_active INTEGER DEFAULT 1,
      target_points INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
    );

    -- 3. Clients
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      location TEXT,
      industry TEXT,
      service TEXT,
      budget REAL DEFAULT 0,
      assigned_member_id TEXT,
      status TEXT CHECK(status IN ('Lead', 'Prospect', 'Active', 'Completed', 'Inactive')) DEFAULT 'Active',
      source TEXT,
      notes TEXT,
      next_follow_up DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_member_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 4. Leads CRM Pipeline
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      source TEXT CHECK(source IN ('Instagram', 'WhatsApp', 'Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Other')) DEFAULT 'Website',
      industry TEXT,
      interested_service TEXT,
      budget REAL DEFAULT 0,
      assigned_to_id TEXT,
      stage TEXT CHECK(stage IN ('NEW_LEAD', 'CONTACTED', 'INTERESTED', 'MEETING', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST')) DEFAULT 'NEW_LEAD',
      follow_up_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 5. Projects
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      description TEXT,
      budget REAL DEFAULT 0,
      start_date DATE,
      deadline DATE,
      status TEXT CHECK(status IN ('Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled')) DEFAULT 'In Progress',
      progress_percentage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    -- 6. Project Members
    CREATE TABLE IF NOT EXISTS project_members (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role_in_project TEXT DEFAULT 'Contributor',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(project_id, user_id)
    );

    -- 7. Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      client_id TEXT,
      project_id TEXT,
      assigned_to_id TEXT NOT NULL,
      created_by_id TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
      deadline DATETIME,
      estimated_hours REAL DEFAULT 0,
      actual_hours REAL DEFAULT 0,
      required_deliverables TEXT,
      status TEXT CHECK(status IN ('TO_DO', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'COMPLETED', 'REJECTED')) DEFAULT 'TO_DO',
      rejection_reason TEXT,
      progress_percentage INTEGER DEFAULT 0,
      submission_notes TEXT,
      submitted_at DATETIME,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- 8. Task Comments
    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 9. Task Attachments
    CREATE TABLE IF NOT EXISTS task_attachments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_by_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 10. Work Reports
    CREATE TABLE IF NOT EXISTS work_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT,
      client_id TEXT,
      report_date DATE NOT NULL,
      work_description TEXT NOT NULL,
      completed_items TEXT,
      implemented_items TEXT,
      hours_worked REAL DEFAULT 0,
      progress_percentage INTEGER DEFAULT 0,
      additional_notes TEXT,
      status TEXT CHECK(status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING_APPROVAL',
      rejection_reason TEXT,
      reviewed_by_id TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 11. Work Report Attachments
    CREATE TABLE IF NOT EXISTS work_report_attachments (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES work_reports(id) ON DELETE CASCADE
    );

    -- 12. Point Rules
    CREATE TABLE IF NOT EXISTS point_rules (
      id TEXT PRIMARY KEY,
      rule_key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      points_delta INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 13. Points Transactions
    CREATE TABLE IF NOT EXISTS points_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      task_id TEXT,
      report_id TEXT,
      admin_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
      FOREIGN KEY (report_id) REFERENCES work_reports(id) ON DELETE SET NULL,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 14. Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      criteria_rule TEXT,
      points_reward INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. User Achievements
    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      awarded_by_id TEXT,
      awarded_reason TEXT,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
      FOREIGN KEY (awarded_by_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(user_id, achievement_id)
    );

    -- 16. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('TASK', 'REPORT', 'POINTS', 'PROJECT', 'LEAD', 'SYSTEM')) DEFAULT 'SYSTEM',
      link_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 17. Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Indexes for high performance querying
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
    CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
    CREATE INDEX IF NOT EXISTS idx_points_user ON points_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_reports_user ON work_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON work_reports(status);
  `);
}

async function seedInitialData() {
  const existingUsers = queryAll('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0] && existingUsers[0].count > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial TAKE TWO OS data...');

  // 1. Roles
  const adminRoleId = uuidv4();
  const memberRoleId = uuidv4();

  runQuery(`INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)`, [
    adminRoleId,
    'admin',
    'Full administrative control over operations, team, CRM, finance, and settings',
    JSON.stringify(['*'])
  ]);

  runQuery(`INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)`, [
    memberRoleId,
    'team_member',
    'Standard team member workspace access for tasks, work logs, points, and clients',
    JSON.stringify(['view_assigned_tasks', 'submit_report', 'view_leaderboard', 'view_points'])
  ]);

  // 2. Initial Users
  const userSeeds = [
    { name: 'Naveed', email: 'naveed@taketwomedia.com', pass: 'Naveed123.', roleId: adminRoleId, designation: 'Managing Director / Admin', phone: '+1 (555) 019-2831' },
    { name: 'Shameer', email: 'shameer@taketwomedia.com', pass: 'Shameer123.', roleId: adminRoleId, designation: 'Operations Director / Admin', phone: '+1 (555) 019-2832' },
    { name: 'Rayyan', email: 'rayyan@taketwomedia.com', pass: 'Rayyan123.', roleId: adminRoleId, designation: 'Creative Director / Admin', phone: '+1 (555) 019-2833' },
    { name: 'Hameed', email: 'hameed@taketwomedia.com', pass: 'Hameed123.', roleId: memberRoleId, designation: 'Senior Full-Stack Developer', phone: '+1 (555) 019-2834' },
    { name: 'Sathar', email: 'sathar@taketwomedia.com', pass: 'Sathar123.', roleId: memberRoleId, designation: 'Lead UI/UX Designer', phone: '+1 (555) 019-2835' },
    { name: 'Asfar', email: 'asfar@taketwomedia.com', pass: 'Asfar123.', roleId: memberRoleId, designation: 'Motion & Video Producer', phone: '+1 (555) 019-2836' },
    { name: 'Hilal', email: 'hilal@taketwomedia.com', pass: 'Hilal123.', roleId: memberRoleId, designation: 'Digital Marketing Strategist', phone: '+1 (555) 019-2837' },
    { name: 'Sivabalan', email: 'sivabalan@taketwomedia.com', pass: 'Sivabalan123.', roleId: memberRoleId, designation: 'Brand & Content Specialist', phone: '+1 (555) 019-2838' },
  ];

  const userMap: Record<string, string> = {};

  for (const u of userSeeds) {
    const id = uuidv4();
    userMap[u.name] = id;
    const passwordHash = await bcrypt.hash(u.pass, 10);
    runQuery(
      `INSERT INTO users (id, role_id, name, email, password_hash, designation, phone, is_active, target_points)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 100)`,
      [id, u.roleId, u.name, u.email, passwordHash, u.designation, u.phone]
    );
  }

  // 3. Point Rules
  const pointRules = [
    { key: 'TASK_COMPLETED', name: 'Task Completed', desc: 'Standard point reward upon task approval', delta: 10 },
    { key: 'TASK_EARLY', name: 'Early Delivery Bonus', desc: 'Completed before deadline', delta: 5 },
    { key: 'HIGH_PRIORITY', name: 'High Priority Task', desc: 'Bonus for high or urgent task delivery', delta: 10 },
    { key: 'CLIENT_WORK_APPROVED', name: 'Client Work Approved', desc: 'Approved milestone deliverables for external client', delta: 10 },
    { key: 'DAILY_REPORT', name: 'Daily Report Submitted', desc: 'Detailed on-time daily work report approved', delta: 2 },
    { key: 'EXCEPTIONAL_WORK', name: 'Exceptional Work', desc: 'Discretionary recognition by Admin', delta: 15 },
    { key: 'MISSED_DEADLINE', name: 'Missed Deadline', desc: 'Deliverable overdue without approval', delta: -5 },
    { key: 'REJECTED_SUBMISSION', name: 'Rejected Submission', desc: 'Work rejected requiring resubmission', delta: -3 },
  ];

  for (const r of pointRules) {
    runQuery(
      `INSERT INTO point_rules (id, rule_key, name, description, points_delta, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [uuidv4(), r.key, r.name, r.desc, r.delta]
    );
  }

  // 4. Achievements / Badges
  const badges = [
    { code: 'TOP_PERFORMER', title: 'Top Performer', desc: 'Consistently ranks at top of the leaderboard', icon: 'Trophy', reward: 25 },
    { code: 'FAST_FINISHER', title: 'Fast Finisher', desc: 'Delivered 5 tasks ahead of deadlines', icon: 'Zap', reward: 15 },
    { code: 'CLUB_100', title: '100% Club', desc: 'Achieved 100%+ of monthly target performance', icon: 'Award', reward: 50 },
    { code: 'CLIENT_CHAMPION', title: 'Client Champion', desc: 'Received outstanding praise from client review', icon: 'Star', reward: 20 },
    { code: 'TECH_MASTER', title: 'Tech Master', desc: 'Executed complex technical architectural milestone', icon: 'Cpu', reward: 20 },
    { code: 'TEAM_PLAYER', title: 'Team Player', desc: 'Assisted team members across multiple projects', icon: 'Users', reward: 15 },
    { code: 'CONSISTENCY_KING', title: 'Consistency King', desc: 'Logged on-time daily reports for 20 consecutive days', icon: 'ShieldCheck', reward: 30 },
    { code: 'EMPLOYEE_OF_MONTH', title: 'Employee of the Month', desc: 'Highest overall contribution to Take Two Media', icon: 'Crown', reward: 100 },
  ];

  const badgeMap: Record<string, string> = {};
  for (const b of badges) {
    const id = uuidv4();
    badgeMap[b.code] = id;
    runQuery(
      `INSERT INTO achievements (id, code, title, description, icon_name, points_reward) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, b.code, b.title, b.desc, b.icon, b.reward]
    );
  }

  // Award initial badges
  runQuery(
    `INSERT INTO user_achievements (id, user_id, achievement_id, awarded_by_id, awarded_reason) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), userMap['Hameed'], badgeMap['CLUB_100'], userMap['Naveed'], 'Hit 100% of target points through top quality development']
  );
  runQuery(
    `INSERT INTO user_achievements (id, user_id, achievement_id, awarded_by_id, awarded_reason) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), userMap['Sathar'], badgeMap['TOP_PERFORMER'], userMap['Rayyan'], 'Outstanding UI/UX work across all brand assets']
  );
  runQuery(
    `INSERT INTO user_achievements (id, user_id, achievement_id, awarded_by_id, awarded_reason) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), userMap['Asfar'], badgeMap['FAST_FINISHER'], userMap['Shameer'], 'Completed campaign video edits 3 days early']
  );

  // 5. Seed 5 Realistic Clients
  const clientsData = [
    { company: 'Apex Fitness Club', contact: 'Marcus Vance', email: 'marcus@apexfitness.com', phone: '+1 555-401-9210', location: 'Dubai / Downtown', industry: 'Fitness & Health', service: 'Full Digital Transformation & Branding', budget: 24000, assigned: userMap['Hilal'], status: 'Active', source: 'Instagram' },
    { company: 'Luminar Tech Solutions', contact: 'Elena Rostova', email: 'elena@luminartech.io', phone: '+1 555-602-8321', location: 'London / Shoreditch', industry: 'SaaS / Enterprise AI', service: 'Web App & Marketing Assets', budget: 38000, assigned: userMap['Hameed'], status: 'Active', source: 'LinkedIn' },
    { company: 'Royal Heritage Banquets', contact: 'Tariq Al-Mansoor', email: 'tariq@royalheritage.ae', phone: '+1 555-703-4412', location: 'Abu Dhabi', industry: 'Luxury Hospitality', service: 'Cinematic Video & Social Media', budget: 18500, assigned: userMap['Asfar'], status: 'Active', source: 'Referral' },
    { company: 'Elevate Real Estate', contact: 'Sarah Jenkins', email: 's.jenkins@elevaterealty.com', phone: '+1 555-804-5533', location: 'Miami / Brickell', industry: 'Real Estate Development', service: 'Lead Gen & Virtual Showcases', budget: 32000, assigned: userMap['Sivabalan'], status: 'Prospect', source: 'Website' },
    { company: 'Craft & Crust Artisan Bakery', contact: 'Julian Dupuis', email: 'julian@craftandcrust.co', phone: '+1 555-905-6644', location: 'Toronto / Yorkville', industry: 'F&B Retail', service: 'E-commerce & Brand Collateral', budget: 12500, assigned: userMap['Sathar'], status: 'Active', source: 'Cold Outreach' },
  ];

  const clientMap: Record<string, string> = {};
  for (const c of clientsData) {
    const id = uuidv4();
    clientMap[c.company] = id;
    runQuery(
      `INSERT INTO clients (id, company_name, contact_person, phone, email, location, industry, service, budget, assigned_member_id, status, source, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, c.company, c.contact, c.phone, c.email, c.location, c.industry, c.service, c.budget, c.assigned, c.status, c.source, `Key account managed by Take Two Media.`]
    );
  }

  // 6. Seed 10 Realistic Leads across Pipeline Stages
  const leadsData = [
    { name: 'Zayn Malik', company: 'Solaria Solar Energy', email: 'zayn@solariaenergy.com', phone: '+1 555-111-2233', source: 'Instagram', industry: 'Clean Energy', service: 'Performance Ads & Funnel', budget: 15000, stage: 'NEW_LEAD', assigned: userMap['Hilal'] },
    { name: 'Rachel Green', company: 'Nova Fashion House', email: 'rachel@novafashion.co', phone: '+1 555-222-3344', source: 'Instagram', industry: 'Luxury Apparel', service: 'E-commerce Store & Reels', budget: 22000, stage: 'CONTACTED', assigned: userMap['Sivabalan'] },
    { name: 'Dr. Karim Sayed', company: 'PrimeCare Clinics', email: 'karim@primecare.ae', phone: '+1 555-333-4455', source: 'Website', industry: 'Healthcare', service: 'Portal & SEO Strategy', budget: 18000, stage: 'INTERESTED', assigned: userMap['Hameed'] },
    { name: 'Amelia Watson', company: 'Horizon Fintech', email: 'amelia@horizonpay.io', phone: '+1 555-444-5566', source: 'LinkedIn', industry: 'FinTech', service: 'Brand System & Explainer Videos', budget: 45000, stage: 'MEETING', assigned: userMap['Naveed'] },
    { name: 'Vikram Patel', company: 'Omni Logistics Hub', email: 'vikram@omnilogistics.in', phone: '+1 555-555-6677', source: 'Cold Outreach', industry: 'Supply Chain', service: 'Corporate Rebrand', budget: 28000, stage: 'PROPOSAL_SENT', assigned: userMap['Shameer'] },
    { name: 'Sophie Bernard', company: 'Chateau Vineyards', email: 'sophie@chateauv.fr', phone: '+1 555-666-7788', source: 'Referral', industry: 'F&B Luxury', service: 'Global D2C Experience', budget: 35000, stage: 'NEGOTIATION', assigned: userMap['Rayyan'] },
    { name: 'Omar Fares', company: 'Oasis Desert Safaris', email: 'omar@oasisadventures.ae', phone: '+1 555-777-8899', source: 'WhatsApp', industry: 'Tourism & Travel', service: 'Booking Platform & Ad Campaigns', budget: 20000, stage: 'WON', assigned: userMap['Hilal'] },
    { name: 'Liam O’Connor', company: 'Titan Construction', email: 'liam@titanbuilds.ie', phone: '+1 555-888-9900', source: 'Website', industry: 'Commercial Construction', service: 'Corporate Portfolio', budget: 12000, stage: 'WON', assigned: userMap['Sathar'] },
    { name: 'Chloe Dubois', company: 'AeroDrone Surveying', email: 'chloe@aerodrone.ca', phone: '+1 555-999-0011', source: 'Other', industry: 'Aviation Tech', service: 'Full Marketing Suite', budget: 9000, stage: 'LOST', assigned: userMap['Sivabalan'] },
    { name: 'Hamad Al-Kaabi', company: 'Prestige Automotive', email: 'hamad@prestigemotors.qa', phone: '+1 555-000-1122', source: 'Instagram', industry: 'Automotive Dealership', service: 'Social Media Management', budget: 30000, stage: 'MEETING', assigned: userMap['Asfar'] },
  ];

  for (const l of leadsData) {
    runQuery(
      `INSERT INTO leads (id, name, company, phone, email, source, industry, interested_service, budget, assigned_to_id, stage, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), l.name, l.company, l.phone, l.email, l.source, l.industry, l.service, l.budget, l.assigned, l.stage, `Acquired through ${l.source} marketing outreach.`]
    );
  }

  // 7. Seed 5 Projects
  const projectsData = [
    { client: 'Apex Fitness Club', name: 'Apex Digital Ecosystem & Mobile App', desc: 'Full custom responsive platform, member portal, class scheduling, and gym branding.', budget: 24000, status: 'In Progress', progress: 65 },
    { client: 'Luminar Tech Solutions', name: 'Luminar AI SaaS Platform UI & Docs', desc: 'Design system, dashboard analytics screens, documentation hub, and high-converting marketing site.', budget: 38000, status: 'In Progress', progress: 80 },
    { client: 'Royal Heritage Banquets', name: 'Cinematic Grand Reopening Campaign', desc: '4K video ads, teaser reels, banquet booking landing page, and social collateral.', budget: 18500, status: 'In Progress', progress: 45 },
    { client: 'Elevate Real Estate', name: 'Elevate VIP Investor Showcase', desc: '3D virtual tour interactive website and lead generation paid funnel.', budget: 32000, status: 'Planning', progress: 15 },
    { client: 'Craft & Crust Artisan Bakery', name: 'Craft & Crust E-Commerce & Identity', desc: 'Shopify custom theme, product photography styling, packaging design.', budget: 12500, status: 'Completed', progress: 100 },
  ];

  const projectMap: Record<string, string> = {};
  for (const p of projectsData) {
    const id = uuidv4();
    projectMap[p.name] = id;
    runQuery(
      `INSERT INTO projects (id, client_id, project_name, description, budget, start_date, deadline, status, progress_percentage)
       VALUES (?, ?, ?, ?, ?, date('now', '-30 days'), date('now', '+30 days'), ?, ?)`,
      [id, clientMap[p.client], p.name, p.desc, p.budget, p.status, p.progress]
    );

    // Assign project members
    runQuery(`INSERT INTO project_members (id, project_id, user_id, role_in_project) VALUES (?, ?, ?, ?)`, [uuidv4(), id, userMap['Hameed'], 'Lead Developer']);
    runQuery(`INSERT INTO project_members (id, project_id, user_id, role_in_project) VALUES (?, ?, ?, ?)`, [uuidv4(), id, userMap['Sathar'], 'Lead Designer']);
    runQuery(`INSERT INTO project_members (id, project_id, user_id, role_in_project) VALUES (?, ?, ?, ?)`, [uuidv4(), id, userMap['Asfar'], 'Media Producer']);
  }

  // 8. Seed 15 Realistic Tasks
  const tasksData = [
    { title: 'Implement Apex Member Booking API', desc: 'Build GraphQL/REST endpoints for member slot reservations and payment integration.', client: 'Apex Fitness Club', proj: 'Apex Digital Ecosystem & Mobile App', assigned: 'Hameed', priority: 'High', status: 'IN_PROGRESS', progress: 70, est: 16 },
    { title: 'Design Mobile Responsive Workout Tracking', desc: 'Create Figma high-fidelity prototypes for trainer and member workout tracking modules.', client: 'Apex Fitness Club', proj: 'Apex Digital Ecosystem & Mobile App', assigned: 'Sathar', priority: 'Medium', status: 'SUBMITTED', progress: 95, est: 12 },
    { title: 'Color Grade Apex Promo 60s Reel', desc: 'Complete final color grading and sound design for gym opening promotional video.', client: 'Apex Fitness Club', proj: 'Apex Digital Ecosystem & Mobile App', assigned: 'Asfar', priority: 'Urgent', status: 'APPROVED', progress: 100, est: 8 },
    { title: 'Luminar AI Data Pipeline Dashboard', desc: 'Build reactive charts using Recharts for AI token consumption and latency metrics.', client: 'Luminar Tech Solutions', proj: 'Luminar AI SaaS Platform UI & Docs', assigned: 'Hameed', priority: 'High', status: 'APPROVED', progress: 100, est: 20 },
    { title: 'Luminar Design Tokens & Dark Mode Specs', desc: 'Define semantic color tokens, typography scales, and accessible component states.', client: 'Luminar Tech Solutions', proj: 'Luminar AI SaaS Platform UI & Docs', assigned: 'Sathar', priority: 'High', status: 'COMPLETED', progress: 100, est: 14 },
    { title: 'Luminar Product Explainer Motion Graphics', desc: 'Render 3D product animations showing model training and output synthesis.', client: 'Luminar Tech Solutions', proj: 'Luminar AI SaaS Platform UI & Docs', assigned: 'Asfar', priority: 'Urgent', status: 'IN_PROGRESS', progress: 50, est: 24 },
    { title: 'Setup Google Tag Manager & Meta Pixel for Luminar', desc: 'Install conversion tracking and event tagging for SaaS trial signups.', client: 'Luminar Tech Solutions', proj: 'Luminar AI SaaS Platform UI & Docs', assigned: 'Hilal', priority: 'Medium', status: 'COMPLETED', progress: 100, est: 6 },
    { title: 'Royal Heritage Banquet Photo Shoot Direction', desc: 'Coordinate shot list, lighting setups, and culinary plating for gala halls.', client: 'Royal Heritage Banquets', proj: 'Cinematic Grand Reopening Campaign', assigned: 'Asfar', priority: 'High', status: 'SUBMITTED', progress: 90, est: 10 },
    { title: 'Royal Heritage Social Media Content Calendar', desc: 'Prepare 30-day editorial calendar with copywriting, hashtags, and asset briefs.', client: 'Royal Heritage Banquets', proj: 'Cinematic Grand Reopening Campaign', assigned: 'Sivabalan', priority: 'Medium', status: 'IN_PROGRESS', progress: 60, est: 12 },
    { title: 'Fix Mobile Header Overflow on Luxury Banquet Page', desc: 'Resolve navigation overlapping logo on viewport widths below 390px.', client: 'Royal Heritage Banquets', proj: 'Cinematic Grand Reopening Campaign', assigned: 'Hameed', priority: 'Medium', status: 'REJECTED', progress: 40, est: 4, reason: 'Mobile responsiveness needs improvement. Navigation still wraps onto two lines on iPhone SE.' },
    { title: 'Elevate Real Estate Brand Guidelines Doc', desc: 'Draft comprehensive 24-page PDF brand guide with logo clearspace and typography.', client: 'Elevate Real Estate', proj: 'Elevate VIP Investor Showcase', assigned: 'Sathar', priority: 'Low', status: 'TO_DO', progress: 0, est: 16 },
    { title: 'Elevate Lead Qualification Questionnaire Script', desc: 'Write script for automated WhatsApp chatbot to qualify high-net-worth property buyers.', client: 'Elevate Real Estate', proj: 'Elevate VIP Investor Showcase', assigned: 'Sivabalan', priority: 'Medium', status: 'IN_PROGRESS', progress: 35, est: 8 },
    { title: 'Craft & Crust E-Commerce Checkout Optimization', desc: 'Enable one-click Apple Pay and Google Pay checkouts on bakery store.', client: 'Craft & Crust Artisan Bakery', proj: 'Craft & Crust E-Commerce & Identity', assigned: 'Hameed', priority: 'High', status: 'COMPLETED', progress: 100, est: 8 },
    { title: 'Craft & Crust Packaging Box Dielines', desc: 'Export print-ready CMYK dieline vectors for custom artisan sourdough boxes.', client: 'Craft & Crust Artisan Bakery', proj: 'Craft & Crust E-Commerce & Identity', assigned: 'Sathar', priority: 'Medium', status: 'COMPLETED', progress: 100, est: 10 },
    { title: 'Craft & Crust Influencer Sampling Strategy', desc: 'Identify 15 local food bloggers and organize delivery drops for bakery launch week.', client: 'Craft & Crust Artisan Bakery', proj: 'Craft & Crust E-Commerce & Identity', assigned: 'Hilal', priority: 'Low', status: 'APPROVED', progress: 100, est: 8 },
  ];

  const taskMap: Record<string, string> = {};
  for (const t of tasksData) {
    const id = uuidv4();
    taskMap[t.title] = id;
    runQuery(
      `INSERT INTO tasks (id, title, description, client_id, project_id, assigned_to_id, created_by_id, priority, deadline, estimated_hours, status, rejection_reason, progress_percentage, submitted_at, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+3 days'), ?, ?, ?, ?, datetime('now', '-1 days'), datetime('now'))`,
      [
        id,
        t.title,
        t.desc,
        clientMap[t.client] || null,
        projectMap[t.proj] || null,
        userMap[t.assigned],
        userMap['Naveed'],
        t.priority,
        t.est,
        t.status,
        (t as any).reason || null,
        t.progress
      ]
    );
  }

  // 9. Seed Daily Work Reports
  const reportsData = [
    { user: 'Hameed', task: 'Implement Apex Member Booking API', client: 'Apex Fitness Club', desc: 'Developed core booking route with date conflict verification and test coverage.', completed: 'Completed POST /api/bookings and slot calculation logic.', implemented: 'Added database transaction lock to avoid double bookings.', hours: 7.5, progress: 70, status: 'PENDING_APPROVAL' },
    { user: 'Sathar', task: 'Design Mobile Responsive Workout Tracking', client: 'Apex Fitness Club', desc: 'Drafted 14 screen variants in Figma for workouts, timers, and rep counters.', completed: 'All 14 mobile frames in Figma completed and linked for prototype demonstration.', implemented: 'Adaptive component variants for light and dark modes.', hours: 6.0, progress: 95, status: 'PENDING_APPROVAL' },
    { user: 'Asfar', task: 'Color Grade Apex Promo 60s Reel', client: 'Apex Fitness Club', desc: 'Applied custom cinematic LUTs, balanced skin tones, and matched contrast.', completed: 'Full 60s 4K master export completed and uploaded.', implemented: 'Audio sound design and bass enhancement on music drops.', hours: 8.0, progress: 100, status: 'APPROVED' },
    { user: 'Hilal', task: 'Setup Google Tag Manager & Meta Pixel for Luminar', client: 'Luminar Tech Solutions', desc: 'Configured events for button clicks, form fills, and free trial activations.', completed: 'GTM container published and verified with Chrome Tag Assistant.', implemented: 'Custom conversion trigger for enterprise demo requests.', hours: 5.5, progress: 100, status: 'APPROVED' },
    { user: 'Sivabalan', task: 'Royal Heritage Social Media Content Calendar', client: 'Royal Heritage Banquets', desc: 'Researched regional trending audio and drafted 15 luxury banquet post captions.', completed: 'Drafted captions 1 to 15 with Arabic & English translations.', implemented: 'Visual grid mockup for Instagram aesthetic flow.', hours: 6.5, progress: 60, status: 'PENDING_APPROVAL' },
  ];

  for (const rep of reportsData) {
    runQuery(
      `INSERT INTO work_reports (id, user_id, task_id, client_id, report_date, work_description, completed_items, implemented_items, hours_worked, progress_percentage, status, reviewed_by_id, reviewed_at)
       VALUES (?, ?, ?, ?, date('now'), ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        uuidv4(),
        userMap[rep.user],
        taskMap[rep.task] || null,
        clientMap[rep.client] || null,
        rep.desc,
        rep.completed,
        rep.implemented,
        rep.hours,
        rep.progress,
        rep.status,
        rep.status === 'APPROVED' ? userMap['Naveed'] : null
      ]
    );
  }

  // 10. Seed Point Transactions (dynamically calculating user points)
  const pointLogs = [
    { user: 'Hameed', pts: 10, reason: 'Task Completed: Luminar AI Data Pipeline Dashboard', admin: 'Naveed' },
    { user: 'Hameed', pts: 10, reason: 'High Priority Task: Luminar AI Platform', admin: 'Naveed' },
    { user: 'Hameed', pts: 10, reason: 'Task Completed: Craft & Crust E-Commerce Checkout', admin: 'Shameer' },
    { user: 'Hameed', pts: 10, reason: 'Client Work Approved: Craft & Crust', admin: 'Rayyan' },
    { user: 'Hameed', pts: 2, reason: 'Daily Work Report Approved', admin: 'Naveed' },
    { user: 'Hameed', pts: 15, reason: 'Exceptional Work: Zero bug checkout delivery', admin: 'Naveed' },
    { user: 'Hameed', pts: 5, reason: 'Early Delivery Bonus', admin: 'Shameer' },
    { user: 'Hameed', pts: 48, reason: 'Milestone target achievement bonus', admin: 'Naveed' }, // Reaches 110 points (110% Outstanding!)

    { user: 'Sathar', pts: 10, reason: 'Task Completed: Luminar Design Tokens', admin: 'Rayyan' },
    { user: 'Sathar', pts: 10, reason: 'Task Completed: Craft & Crust Packaging', admin: 'Rayyan' },
    { user: 'Sathar', pts: 10, reason: 'High Priority Task delivery', admin: 'Rayyan' },
    { user: 'Sathar', pts: 10, reason: 'Client Work Approved: Craft & Crust Dielines', admin: 'Naveed' },
    { user: 'Sathar', pts: 2, reason: 'Daily Report Approved', admin: 'Naveed' },
    { user: 'Sathar', pts: 5, reason: 'Early Delivery Bonus', admin: 'Rayyan' },
    { user: 'Sathar', pts: 35, reason: 'Monthly Design Consistency Reward', admin: 'Rayyan' }, // 82 points (82% Very Good)

    { user: 'Asfar', pts: 10, reason: 'Task Completed: Color Grade Apex Promo', admin: 'Shameer' },
    { user: 'Asfar', pts: 10, reason: 'High Priority: Urgent 60s reel delivery', admin: 'Shameer' },
    { user: 'Asfar', pts: 5, reason: 'Early Delivery Bonus: 3 days ahead', admin: 'Shameer' },
    { user: 'Asfar', pts: 10, reason: 'Client Work Approved: Apex Fitness Video', admin: 'Naveed' },
    { user: 'Asfar', pts: 2, reason: 'Daily Report Approved', admin: 'Naveed' },
    { user: 'Asfar', pts: 30, reason: 'Cinematic Reel Viral Performance Bonus', admin: 'Rayyan' }, // 67 points (67% Good)

    { user: 'Hilal', pts: 10, reason: 'Task Completed: GTM Setup for Luminar', admin: 'Naveed' },
    { user: 'Hilal', pts: 10, reason: 'Task Completed: Influencer Strategy', admin: 'Shameer' },
    { user: 'Hilal', pts: 10, reason: 'Client Work Approved', admin: 'Naveed' },
    { user: 'Hilal', pts: 2, reason: 'Daily Report Approved', admin: 'Naveed' },
    { user: 'Hilal', pts: 20, reason: 'Lead Conversion Ad Optimization Bonus', admin: 'Naveed' }, // 52 points (52% Developing)

    { user: 'Sivabalan', pts: 10, reason: 'Task Completed: Content Strategy', admin: 'Naveed' },
    { user: 'Sivabalan', pts: 2, reason: 'Daily Report Approved', admin: 'Naveed' },
    { user: 'Sivabalan', pts: 10, reason: 'Client Brand Identity Research', admin: 'Rayyan' },
    { user: 'Sivabalan', pts: 10, reason: 'Lead Follow-up Excellence', admin: 'Shameer' }, // 32 points (32% Needs Improvement)
  ];

  for (const p of pointLogs) {
    runQuery(
      `INSERT INTO points_transactions (id, user_id, points, reason, admin_id, created_at) VALUES (?, ?, ?, ?, ?, datetime('now', '-2 days'))`,
      [uuidv4(), userMap[p.user], p.pts, p.reason, userMap[p.admin]]
    );
  }

  // 11. Seed Notifications
  const notifs = [
    { user: 'Hameed', title: 'Task Approved', msg: 'Your task "Luminar AI Data Pipeline Dashboard" was approved! +10 Points awarded.', type: 'POINTS' },
    { user: 'Hameed', title: 'New Task Assigned', msg: 'Naveed assigned "Implement Apex Member Booking API" to you.', type: 'TASK' },
    { user: 'Hameed', title: 'Task Feedback', msg: 'Task "Fix Mobile Header Overflow" was rejected: Mobile responsiveness needs improvement.', type: 'TASK' },
    { user: 'Sathar', title: 'Work Approved', msg: 'Shameer approved "Design Mobile Responsive Workout Tracking". +10 Points.', type: 'POINTS' },
    { user: 'Asfar', title: 'Achievement Unlocked', msg: 'Congratulations! You earned the "Fast Finisher" badge.', type: 'POINTS' },
    { user: 'Naveed', title: 'Daily Report Pending Review', msg: 'Hameed submitted a daily work report for Apex Fitness Club.', type: 'REPORT' },
    { user: 'Naveed', title: 'New Lead Won', msg: 'Lead "Oasis Desert Safaris" moved to WON stage ($20,000).', type: 'LEAD' },
    { user: 'Shameer', title: 'Task Submitted', msg: 'Sathar submitted "Design Mobile Responsive Workout Tracking" for review.', type: 'TASK' },
  ];

  for (const n of notifs) {
    runQuery(
      `INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)`,
      [uuidv4(), userMap[n.user], n.title, n.msg, n.type]
    );
  }

  // 12. Seed Audit Logs
  const audits = [
    { user: 'Naveed', action: 'LOGIN', entity: 'AUTH', desc: 'Admin Naveed logged into TAKE TWO OS' },
    { user: 'Naveed', action: 'CREATE', entity: 'TASK', desc: 'Created task "Implement Apex Member Booking API" assigned to Hameed' },
    { user: 'Shameer', action: 'ASSIGN', entity: 'LEAD', desc: 'Assigned lead "Omni Logistics Hub" to Shameer' },
    { user: 'Rayyan', action: 'APPROVE', entity: 'TASK', desc: 'Approved task "Luminar Design Tokens & Dark Mode Specs" for Sathar' },
    { user: 'Rayyan', action: 'POINTS_AWARDED', entity: 'POINTS', desc: 'Awarded +10 points to Sathar for task completion' },
    { user: 'Naveed', action: 'REJECT', entity: 'TASK', desc: 'Rejected task "Fix Mobile Header Overflow": Mobile responsiveness needs improvement' },
  ];

  for (const a of audits) {
    runQuery(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, description) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), userMap[a.user], a.action, a.entity, a.desc]
    );
  }

  saveDatabase();
  console.log('TAKE TWO OS database initialized and seeded successfully with 8 users & full demo environment!');
}
