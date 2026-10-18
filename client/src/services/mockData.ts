// COCO MEDIA - Production-grade Mock Data & Local Persistence Layer
// Ensures 100% fault-tolerant functionality on Vercel deployments

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member';
  designation: string;
  phone: string;
  avatar_url?: string;
  is_active: number;
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_name?: string;
  assigned_to_id: string;
  assigned_to_name?: string;
  created_by_id?: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  deadline: string;
  estimated_hours: number;
  actual_hours?: number;
  status: 'TO_DO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  rejection_reason?: string;
  progress_percentage: number;
  submitted_at?: string;
  approved_at?: string;
  created_at?: string;
}

export interface MockReport {
  id: string;
  user_id: string;
  user_name?: string;
  task_id?: string;
  task_title?: string;
  client_id?: string;
  client_name?: string;
  report_date: string;
  work_description: string;
  completed_items?: string;
  completed?: string;
  implemented_items?: string;
  implemented?: string;
  hours_worked: number;
  progress_percentage: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
}

export interface MockClient {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  location: string;
  industry: string;
  service: string;
  budget: number;
  assigned_member_id?: string;
  assigned_name?: string;
  status: 'Lead' | 'Prospect' | 'Active' | 'Completed' | 'Inactive';
  source: string;
  notes?: string;
}

export interface MockLead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  industry: string;
  interested_service: string;
  budget: number;
  assigned_to_id?: string;
  assigned_name?: string;
  stage: 'NEW_LEAD' | 'CONTACTED' | 'INTERESTED' | 'MEETING' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  notes?: string;
}

export interface MockProject {
  id: string;
  client_id: string;
  client_name?: string;
  project_name: string;
  description: string;
  budget: number;
  start_date: string;
  deadline: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold';
  progress_percentage: number;
}

export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link_url?: string;
  is_read: number;
  created_at: string;
}

export interface MockAuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  created_at: string;
}

const STORAGE_KEY = 'coco_media_store_v1';

// Seed Users: Naveed, Shameer, and Rayyan are Administrators; Alhameed is a Team Member
export const SEED_USERS: MockUser[] = [
  {
    id: 'u-alhameed',
    name: 'Alhameed',
    email: 'alhameed@cocomedia.com',
    role: 'team_member',
    designation: 'Senior Video Editor & Media Specialist',
    phone: '+1 (555) 019-2834',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-naveed',
    name: 'Naveed',
    email: 'naveed@cocomedia.com',
    role: 'admin',
    designation: 'Managing Director / Admin',
    phone: '+1 (555) 019-2831',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-shameer',
    name: 'Shameer',
    email: 'shameer@cocomedia.com',
    role: 'admin',
    designation: 'Operations Director / Admin',
    phone: '+1 (555) 019-2832',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-rayyan',
    name: 'Rayyan',
    email: 'rayyan@cocomedia.com',
    role: 'admin',
    designation: 'Creative Director / Admin',
    phone: '+1 (555) 019-2833',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-sathar',
    name: 'Sathar',
    email: 'sathar@cocomedia.com',
    role: 'team_member',
    designation: 'Lead UI/UX Designer',
    phone: '+1 (555) 019-2835',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-asfar',
    name: 'Asfar',
    email: 'asfar@cocomedia.com',
    role: 'team_member',
    designation: 'Motion & Video Producer',
    phone: '+1 (555) 019-2836',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-hilal',
    name: 'Hilal',
    email: 'hilal@cocomedia.com',
    role: 'team_member',
    designation: 'Digital Marketing Strategist',
    phone: '+1 (555) 019-2837',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
  {
    id: 'u-sivabalan',
    name: 'Sivabalan',
    email: 'sivabalan@cocomedia.com',
    role: 'team_member',
    designation: 'Brand & Content Specialist',
    phone: '+1 (555) 019-2838',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    is_active: 1,
  },
];

export const SEED_CLIENTS: MockClient[] = [
  { id: 'c-1', company_name: 'Apex Fitness Club', contact_person: 'Marcus Vance', email: 'marcus@apexfitness.com', phone: '+1 555-401-9210', location: 'Dubai / Downtown', industry: 'Fitness & Health', service: 'Full Digital Transformation & Branding', budget: 24000, assigned_member_id: 'u-hilal', assigned_name: 'Hilal', status: 'Active', source: 'Instagram' },
  { id: 'c-2', company_name: 'Luminar Tech Solutions', contact_person: 'Elena Rostova', email: 'elena@luminartech.io', phone: '+1 555-602-8321', location: 'London / Shoreditch', industry: 'SaaS / Enterprise AI', service: 'Web App & Marketing Assets', budget: 38000, assigned_member_id: 'u-alhameed', assigned_name: 'Alhameed', status: 'Active', source: 'LinkedIn' },
  { id: 'c-3', company_name: 'Royal Heritage Banquets', contact_person: 'Tariq Al-Mansoor', email: 'tariq@royalheritage.ae', phone: '+1 555-703-4412', location: 'Abu Dhabi', industry: 'Luxury Hospitality', service: 'Cinematic Video & Social Media', budget: 18500, assigned_member_id: 'u-asfar', assigned_name: 'Asfar', status: 'Active', source: 'Referral' },
  { id: 'c-4', company_name: 'Elevate Real Estate', contact_person: 'Sarah Jenkins', email: 's.jenkins@elevaterealty.com', phone: '+1 555-804-5533', location: 'Miami / Brickell', industry: 'Real Estate Development', service: 'Lead Gen & Virtual Showcases', budget: 32000, assigned_member_id: 'u-sivabalan', assigned_name: 'Sivabalan', status: 'Prospect', source: 'Website' },
  { id: 'c-5', company_name: 'Craft & Crust Artisan Bakery', contact_person: 'Julian Dupuis', email: 'julian@craftandcrust.co', phone: '+1 555-905-6644', location: 'Toronto / Yorkville', industry: 'F&B Retail', service: 'E-commerce & Brand Collateral', budget: 12500, assigned_member_id: 'u-sathar', assigned_name: 'Sathar', status: 'Active', source: 'Cold Outreach' },
];

export const SEED_PROJECTS: MockProject[] = [
  { id: 'p-1', client_id: 'c-1', client_name: 'Apex Fitness Club', project_name: 'Apex Digital Ecosystem & Mobile App', description: 'Full custom responsive platform, member portal, class scheduling, and gym branding.', budget: 24000, start_date: '2026-03-01', deadline: '2026-05-15', status: 'In Progress', progress_percentage: 75 },
  { id: 'p-2', client_id: 'c-2', client_name: 'Luminar Tech Solutions', project_name: 'Luminar AI SaaS Platform UI & Docs', description: 'Design system, dashboard analytics screens, documentation hub, and high-converting marketing site.', budget: 38000, start_date: '2026-02-15', deadline: '2026-04-30', status: 'In Progress', progress_percentage: 85 },
  { id: 'p-3', client_id: 'c-3', client_name: 'Royal Heritage Banquets', project_name: 'Cinematic Grand Reopening Campaign', description: '4K video ads, teaser reels, banquet booking landing page, and social collateral.', budget: 18500, start_date: '2026-03-10', deadline: '2026-04-20', status: 'In Progress', progress_percentage: 60 },
  { id: 'p-4', client_id: 'c-4', client_name: 'Elevate Real Estate', project_name: 'Elevate VIP Investor Showcase', description: '3D virtual tour interactive website and lead generation paid funnel.', budget: 32000, start_date: '2026-03-20', deadline: '2026-06-01', status: 'Planning', progress_percentage: 25 },
  { id: 'p-5', client_id: 'c-5', client_name: 'Craft & Crust Artisan Bakery', project_name: 'Craft & Crust E-Commerce & Identity', description: 'Shopify custom theme, product photography styling, packaging design.', budget: 12500, start_date: '2026-01-10', deadline: '2026-03-01', status: 'Completed', progress_percentage: 100 },
];

export const SEED_TASKS: MockTask[] = [
  { id: 't-1', title: 'Implement Apex Member Booking API', description: 'Build REST endpoints for member slot reservations and payment integration.', client_id: 'c-1', client_name: 'Apex Fitness Club', project_id: 'p-1', project_name: 'Apex Digital Ecosystem & Mobile App', assigned_to_id: 'u-alhameed', assigned_to_name: 'Alhameed', priority: 'High', deadline: '2026-10-25', estimated_hours: 16, status: 'IN_PROGRESS', progress_percentage: 75 },
  { id: 't-2', title: 'Design Mobile Responsive Workout Tracking', description: 'Create Figma high-fidelity prototypes for trainer and member workout tracking modules.', client_id: 'c-1', client_name: 'Apex Fitness Club', project_id: 'p-1', project_name: 'Apex Digital Ecosystem & Mobile App', assigned_to_id: 'u-sathar', assigned_to_name: 'Sathar', priority: 'Medium', deadline: '2026-10-22', estimated_hours: 12, status: 'SUBMITTED', progress_percentage: 95 },
  { id: 't-3', title: 'Color Grade Apex Promo 60s Reel', description: 'Complete final color grading and sound design for gym opening promotional video.', client_id: 'c-1', client_name: 'Apex Fitness Club', project_id: 'p-1', project_name: 'Apex Digital Ecosystem & Mobile App', assigned_to_id: 'u-asfar', assigned_to_name: 'Asfar', priority: 'Urgent', deadline: '2026-10-20', estimated_hours: 8, status: 'APPROVED', progress_percentage: 100 },
  { id: 't-4', title: 'Luminar AI Data Pipeline Dashboard', description: 'Build reactive charts using Recharts for AI token consumption and latency metrics.', client_id: 'c-2', client_name: 'Luminar Tech Solutions', project_id: 'p-2', project_name: 'Luminar AI SaaS Platform UI & Docs', assigned_to_id: 'u-alhameed', assigned_to_name: 'Alhameed', priority: 'High', deadline: '2026-10-19', estimated_hours: 20, status: 'APPROVED', progress_percentage: 100 },
  { id: 't-5', title: 'Luminar Design Tokens & Dark Mode Specs', description: 'Define semantic color tokens, typography scales, and accessible component states.', client_id: 'c-2', client_name: 'Luminar Tech Solutions', project_id: 'p-2', project_name: 'Luminar AI SaaS Platform UI & Docs', assigned_to_id: 'u-sathar', assigned_to_name: 'Sathar', priority: 'High', deadline: '2026-10-18', estimated_hours: 14, status: 'COMPLETED', progress_percentage: 100 },
  { id: 't-6', title: 'Luminar Product Explainer Motion Graphics', description: 'Render 3D product animations showing model training and output synthesis.', client_id: 'c-2', client_name: 'Luminar Tech Solutions', project_id: 'p-2', project_name: 'Luminar AI SaaS Platform UI & Docs', assigned_to_id: 'u-asfar', assigned_to_name: 'Asfar', priority: 'Urgent', deadline: '2026-10-27', estimated_hours: 24, status: 'IN_PROGRESS', progress_percentage: 50 },
  { id: 't-7', title: 'Setup Google Tag Manager & Meta Pixel for Luminar', description: 'Install conversion tracking and event tagging for SaaS trial signups.', client_id: 'c-2', client_name: 'Luminar Tech Solutions', project_id: 'p-2', project_name: 'Luminar AI SaaS Platform UI & Docs', assigned_to_id: 'u-hilal', assigned_to_name: 'Hilal', priority: 'Medium', deadline: '2026-10-15', estimated_hours: 6, status: 'COMPLETED', progress_percentage: 100 },
  { id: 't-8', title: 'Royal Heritage Banquet Photo Shoot Direction', description: 'Coordinate shot list, lighting setups, and culinary plating for gala halls.', client_id: 'c-3', client_name: 'Royal Heritage Banquets', project_id: 'p-3', project_name: 'Cinematic Grand Reopening Campaign', assigned_to_id: 'u-asfar', assigned_to_name: 'Asfar', priority: 'High', deadline: '2026-10-24', estimated_hours: 10, status: 'SUBMITTED', progress_percentage: 90 },
  { id: 't-9', title: 'Royal Heritage Social Media Content Calendar', description: 'Prepare 30-day editorial calendar with copywriting, hashtags, and asset briefs.', client_id: 'c-3', client_name: 'Royal Heritage Banquets', project_id: 'p-3', project_name: 'Cinematic Grand Reopening Campaign', assigned_to_id: 'u-sivabalan', assigned_to_name: 'Sivabalan', priority: 'Medium', deadline: '2026-10-26', estimated_hours: 12, status: 'IN_PROGRESS', progress_percentage: 60 },
  { id: 't-10', title: 'Fix Mobile Header Overflow on Luxury Banquet Page', description: 'Resolve navigation overlapping logo on viewport widths below 390px.', client_id: 'c-3', client_name: 'Royal Heritage Banquets', project_id: 'p-3', project_name: 'Cinematic Grand Reopening Campaign', assigned_to_id: 'u-alhameed', assigned_to_name: 'Alhameed', priority: 'Medium', deadline: '2026-10-23', estimated_hours: 4, status: 'REJECTED', rejection_reason: 'Mobile responsiveness needs refinement. Hamburger navigation wraps.', progress_percentage: 45 },
  { id: 't-11', title: 'Elevate Real Estate Brand Guidelines Doc', description: 'Draft comprehensive brand guide with logo clearspace and typography.', client_id: 'c-4', client_name: 'Elevate Real Estate', project_id: 'p-4', project_name: 'Elevate VIP Investor Showcase', assigned_to_id: 'u-sathar', assigned_to_name: 'Sathar', priority: 'Low', deadline: '2026-11-02', estimated_hours: 16, status: 'TO_DO', progress_percentage: 0 },
  { id: 't-12', title: 'Elevate Lead Qualification Questionnaire Script', description: 'Write automated chatbot script to qualify high-net-worth property buyers.', client_id: 'c-4', client_name: 'Elevate Real Estate', project_id: 'p-4', project_name: 'Elevate VIP Investor Showcase', assigned_to_id: 'u-sivabalan', assigned_to_name: 'Sivabalan', priority: 'Medium', deadline: '2026-10-28', estimated_hours: 8, status: 'IN_PROGRESS', progress_percentage: 35 },
  { id: 't-13', title: 'Craft & Crust E-Commerce Checkout Optimization', description: 'Enable one-click Apple Pay and Google Pay checkouts on bakery store.', client_id: 'c-5', client_name: 'Craft & Crust Artisan Bakery', project_id: 'p-5', project_name: 'Craft & Crust E-Commerce & Identity', assigned_to_id: 'u-alhameed', assigned_to_name: 'Alhameed', priority: 'High', deadline: '2026-10-14', estimated_hours: 8, status: 'COMPLETED', progress_percentage: 100 },
  { id: 't-14', title: 'Craft & Crust Packaging Box Dielines', description: 'Export print-ready CMYK dieline vectors for custom artisan sourdough boxes.', client_id: 'c-5', client_name: 'Craft & Crust Artisan Bakery', project_id: 'p-5', project_name: 'Craft & Crust E-Commerce & Identity', assigned_to_id: 'u-sathar', assigned_to_name: 'Sathar', priority: 'Medium', deadline: '2026-10-12', estimated_hours: 10, status: 'COMPLETED', progress_percentage: 100 },
  { id: 't-15', title: 'Craft & Crust Influencer Sampling Strategy', description: 'Identify 15 local food bloggers and organize delivery drops for bakery launch week.', client_id: 'c-5', client_name: 'Craft & Crust Artisan Bakery', project_id: 'p-5', project_name: 'Craft & Crust E-Commerce & Identity', assigned_to_id: 'u-hilal', assigned_to_name: 'Hilal', priority: 'Low', deadline: '2026-10-16', estimated_hours: 8, status: 'APPROVED', progress_percentage: 100 },
];

export const SEED_REPORTS: MockReport[] = [
  { id: 'r-1', user_id: 'u-alhameed', user_name: 'Alhameed', task_id: 't-1', task_title: 'Implement Apex Member Booking API', client_id: 'c-1', client_name: 'Apex Fitness Club', report_date: new Date().toISOString().split('T')[0], work_description: 'Developed core booking route with date conflict verification and test coverage.', completed_items: 'Completed POST /api/bookings and slot calculation logic.', implemented: 'Added transaction lock to avoid double bookings.', hours_worked: 7.5, progress_percentage: 75, status: 'PENDING_APPROVAL' },
  { id: 'r-2', user_id: 'u-sathar', user_name: 'Sathar', task_id: 't-2', task_title: 'Design Mobile Responsive Workout Tracking', client_id: 'c-1', client_name: 'Apex Fitness Club', report_date: new Date().toISOString().split('T')[0], work_description: 'Drafted 14 screen variants in Figma for workouts, timers, and rep counters.', completed_items: 'All 14 mobile frames in Figma completed and linked for prototype demonstration.', implemented: 'Adaptive component variants for light and dark modes.', hours_worked: 6.0, progress_percentage: 95, status: 'PENDING_APPROVAL' },
  { id: 'r-3', user_id: 'u-asfar', user_name: 'Asfar', task_id: 't-3', task_title: 'Color Grade Apex Promo 60s Reel', client_id: 'c-1', client_name: 'Apex Fitness Club', report_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], work_description: 'Applied custom cinematic LUTs, balanced skin tones, and matched contrast.', completed_items: 'Full 60s 4K master export completed and uploaded.', implemented: 'Audio sound design and bass enhancement on music drops.', hours_worked: 8.0, progress_percentage: 100, status: 'APPROVED', reviewed_by_id: 'u-shameer', reviewed_at: new Date().toISOString() },
  { id: 'r-4', user_id: 'u-hilal', user_name: 'Hilal', task_id: 't-7', task_title: 'Setup Google Tag Manager & Meta Pixel for Luminar', client_id: 'c-2', client_name: 'Luminar Tech Solutions', report_date: new Date(Date.now() - 172800000).toISOString().split('T')[0], work_description: 'Configured events for button clicks, form fills, and free trial activations.', completed_items: 'GTM container published and verified with Tag Assistant.', implemented: 'Custom conversion trigger for enterprise demo requests.', hours_worked: 5.5, progress_percentage: 100, status: 'APPROVED', reviewed_by_id: 'u-naveed', reviewed_at: new Date().toISOString() },
  { id: 'r-5', user_id: 'u-sivabalan', user_name: 'Sivabalan', task_id: 't-9', task_title: 'Royal Heritage Social Media Content Calendar', client_id: 'c-3', client_name: 'Royal Heritage Banquets', report_date: new Date().toISOString().split('T')[0], work_description: 'Researched regional trending audio and drafted 15 luxury banquet post captions.', completed_items: 'Drafted captions 1 to 15 with Arabic & English translations.', implemented: 'Visual grid mockup for Instagram aesthetic flow.', hours_worked: 6.5, progress_percentage: 60, status: 'PENDING_APPROVAL' },
];

export const SEED_LEADS: MockLead[] = [
  { id: 'l-1', name: 'Zayn Malik', company: 'Solaria Solar Energy', phone: '+1 555-111-2233', email: 'zayn@solariaenergy.com', source: 'Instagram', industry: 'Clean Energy', interested_service: 'Performance Ads & Funnel', budget: 15000, assigned_to_id: 'u-hilal', assigned_name: 'Hilal', stage: 'NEW_LEAD', notes: 'Initial outreach from solar campaign' },
  { id: 'l-2', name: 'Rachel Green', company: 'Nova Fashion House', phone: '+1 555-222-3344', email: 'rachel@novafashion.co', source: 'Instagram', industry: 'Luxury Apparel', interested_service: 'E-commerce Store & Reels', budget: 22000, assigned_to_id: 'u-sivabalan', assigned_name: 'Sivabalan', stage: 'CONTACTED', notes: 'Call scheduled for Thursday' },
  { id: 'l-3', name: 'Dr. Karim Sayed', company: 'PrimeCare Clinics', phone: '+1 555-333-4455', email: 'karim@primecare.ae', source: 'Website', industry: 'Healthcare', interested_service: 'Portal & SEO Strategy', budget: 18000, assigned_to_id: 'u-alhameed', assigned_name: 'Alhameed', stage: 'INTERESTED', notes: 'Needs HIPAA compliant patient portal' },
  { id: 'l-4', name: 'Amelia Watson', company: 'Horizon Fintech', phone: '+1 555-444-5566', email: 'amelia@horizonpay.io', source: 'LinkedIn', industry: 'FinTech', interested_service: 'Brand System & Explainer Videos', budget: 45000, assigned_to_id: 'u-naveed', assigned_name: 'Naveed', stage: 'MEETING', notes: 'Pitch meeting deck completed' },
  { id: 'l-5', name: 'Vikram Patel', company: 'Omni Logistics Hub', phone: '+1 555-555-6677', email: 'vikram@omnilogistics.in', source: 'Cold Outreach', industry: 'Supply Chain', interested_service: 'Corporate Rebrand', budget: 28000, assigned_to_id: 'u-shameer', assigned_name: 'Shameer', stage: 'PROPOSAL_SENT', notes: 'Contract sent, awaiting CFO review' },
  { id: 'l-6', name: 'Sophie Bernard', company: 'Chateau Vineyards', phone: '+1 555-666-7788', email: 'sophie@chateauv.fr', source: 'Referral', industry: 'F&B Luxury', interested_service: 'Global D2C Experience', budget: 35000, assigned_to_id: 'u-rayyan', assigned_name: 'Rayyan', stage: 'NEGOTIATION', notes: 'Finalizing payment terms' },
  { id: 'l-7', name: 'Omar Fares', company: 'Oasis Desert Safaris', phone: '+1 555-777-8899', email: 'omar@oasisadventures.ae', source: 'WhatsApp', industry: 'Tourism & Travel', interested_service: 'Booking Platform & Ad Campaigns', budget: 20000, assigned_to_id: 'u-hilal', assigned_name: 'Hilal', stage: 'WON', notes: 'Converted! Kickoff scheduled.' },
  { id: 'l-8', name: 'Liam O’Connor', company: 'Titan Construction', phone: '+1 555-888-9900', email: 'liam@titanbuilds.ie', source: 'Website', industry: 'Commercial Construction', interested_service: 'Corporate Portfolio', budget: 12000, assigned_to_id: 'u-sathar', assigned_name: 'Sathar', stage: 'WON', notes: 'Retainer signed.' },
  { id: 'l-9', name: 'Chloe Dubois', company: 'AeroDrone Surveying', phone: '+1 555-999-0011', email: 'chloe@aerodrone.ca', source: 'Other', industry: 'Aviation Tech', interested_service: 'Full Marketing Suite', budget: 9000, assigned_to_id: 'u-sivabalan', assigned_name: 'Sivabalan', stage: 'LOST', notes: 'Client paused budget for Q2' },
  { id: 'l-10', name: 'Hamad Al-Kaabi', company: 'Prestige Automotive', phone: '+1 555-000-1122', email: 'hamad@prestigemotors.qa', source: 'Instagram', industry: 'Automotive Dealership', interested_service: 'Social Media Management', budget: 30000, assigned_to_id: 'u-asfar', assigned_name: 'Asfar', stage: 'MEETING', notes: 'In-person meeting in Doha' },
];

export const SEED_NOTIFICATIONS: MockNotification[] = [
  { id: 'n-1', user_id: 'u-alhameed', title: 'Task Approved', message: 'Luminar AI Data Pipeline Dashboard was approved by Naveed.', type: 'TASK', is_read: 0, created_at: new Date().toISOString() },
  { id: 'n-2', user_id: 'u-alhameed', title: 'New Lead Won', message: 'Lead "Oasis Desert Safaris" moved to WON stage ($20,000).', type: 'LEAD', is_read: 0, created_at: new Date().toISOString() },
  { id: 'n-3', user_id: 'u-sathar', title: 'Work Approved', message: 'Shameer approved "Design Mobile Responsive Workout Tracking".', type: 'TASK', is_read: 0, created_at: new Date().toISOString() },
  { id: 'n-4', user_id: 'u-naveed', title: 'Daily Report Pending Review', message: 'Alhameed submitted a daily work report for Apex Fitness Club.', type: 'REPORT', is_read: 0, created_at: new Date().toISOString() },
];

export const SEED_AUDIT_LOGS: MockAuditLog[] = [
  { id: 'a-1', user_name: 'Alhameed', action: 'LOGIN', entity_type: 'AUTH', description: 'Alhameed logged into COCO MEDIA OS', created_at: new Date().toISOString() },
  { id: 'a-2', user_name: 'Naveed', action: 'CREATE', entity_type: 'TASK', description: 'Created task "Implement Apex Member Booking API" assigned to Alhameed', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a-3', user_name: 'Shameer', action: 'APPROVE', entity_type: 'REPORT', description: 'Approved daily work report for Asfar on Apex Fitness Club', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a-4', user_name: 'Rayyan', action: 'UPDATE', entity_type: 'LEAD', description: 'Moved lead "Horizon Fintech" to MEETING stage ($45,000)', created_at: new Date(Date.now() - 14400000).toISOString() },
];

// In-Memory & LocalStorage State Container
class MockStore {
  users: MockUser[] = [];
  tasks: MockTask[] = [];
  reports: MockReport[] = [];
  clients: MockClient[] = [];
  leads: MockLead[] = [];
  projects: MockProject[] = [];
  notifications: MockNotification[] = [];
  auditLogs: MockAuditLog[] = [];

  constructor() {
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.users = parsed.users || SEED_USERS;
        this.tasks = parsed.tasks || SEED_TASKS;
        this.reports = parsed.reports || SEED_REPORTS;
        this.clients = parsed.clients || SEED_CLIENTS;
        this.leads = parsed.leads || SEED_LEADS;
        this.projects = parsed.projects || SEED_PROJECTS;
        this.notifications = parsed.notifications || SEED_NOTIFICATIONS;
        this.auditLogs = parsed.auditLogs || SEED_AUDIT_LOGS;

        // Ensure Alhameed is set to team_member even in previously cached localStorage
        const alhameed = this.users.find(u => u.email.includes('hameed') || u.name.includes('Hameed'));
        if (alhameed) {
          alhameed.name = 'Alhameed';
          alhameed.email = 'alhameed@cocomedia.com';
          alhameed.role = 'team_member';
          alhameed.designation = 'Senior Video Editor & Media Specialist';
        } else {
          this.users.unshift(SEED_USERS[0]);
        }
        return;
      }
    } catch (e) {
      console.warn('Could not load from localStorage, initializing seeds', e);
    }

    this.users = [...SEED_USERS];
    this.tasks = [...SEED_TASKS];
    this.reports = [...SEED_REPORTS];
    this.clients = [...SEED_CLIENTS];
    this.leads = [...SEED_LEADS];
    this.projects = [...SEED_PROJECTS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.auditLogs = [...SEED_AUDIT_LOGS];
    this.save();
  }

  save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users: this.users,
          tasks: this.tasks,
          reports: this.reports,
          clients: this.clients,
          leads: this.leads,
          projects: this.projects,
          notifications: this.notifications,
          auditLogs: this.auditLogs,
        })
      );
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  getAdminAnalytics() {
    const totalMembers = this.users.length;
    const activeMembers = this.users.filter(u => u.is_active).length;
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
    const pendingApprovals = this.tasks.filter(t => t.status === 'SUBMITTED').length + this.reports.filter(r => r.status === 'PENDING_APPROVAL').length;
    const activeClients = this.clients.filter(c => c.status === 'Active').length;
    const totalClients = this.clients.length;
    const activeLeads = this.leads.filter(l => l.stage !== 'WON' && l.stage !== 'LOST').length;
    const pipelineValue = this.leads.filter(l => l.stage !== 'LOST').reduce((sum, l) => sum + (l.budget || 0), 0);
    const activeProjects = this.projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = this.projects.filter(p => p.status === 'Completed').length;
    const approvalRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
    const rejectionRate = 4;

    const leadSources = [
      { source: 'Instagram', count: this.leads.filter(l => l.source === 'Instagram').length },
      { source: 'Website', count: this.leads.filter(l => l.source === 'Website').length },
      { source: 'LinkedIn', count: this.leads.filter(l => l.source === 'LinkedIn').length },
      { source: 'Referral', count: this.leads.filter(l => l.source === 'Referral').length },
      { source: 'Cold Outreach', count: this.leads.filter(l => l.source === 'Cold Outreach').length },
      { source: 'WhatsApp', count: this.leads.filter(l => l.source === 'WhatsApp').length },
    ];

    const weeklyProductivity = [
      { log_date: 'Mon', tasks_delivered: 4, hours_logged: 28 },
      { log_date: 'Tue', tasks_delivered: 6, hours_logged: 34 },
      { log_date: 'Wed', tasks_delivered: 5, hours_logged: 31 },
      { log_date: 'Thu', tasks_delivered: 8, hours_logged: 38 },
      { log_date: 'Fri', tasks_delivered: 9, hours_logged: 42 },
      { log_date: 'Sat', tasks_delivered: 3, hours_logged: 16 },
      { log_date: 'Sun', tasks_delivered: 2, hours_logged: 10 },
    ];

    const memberProductivity = this.users.map((u) => {
      const userTasks = this.tasks.filter(t => t.assigned_to_id === u.id);
      const done = userTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
      const pending = userTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'SUBMITTED').length;
      const userReports = this.reports.filter(r => r.user_id === u.id);
      const hours = userReports.reduce((sum, r) => sum + (r.hours_worked || 0), 0) || 35;
      const completionRate = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 90;

      return {
        user_id: u.id,
        name: u.name,
        designation: u.designation,
        role: u.role,
        tasks_done: done,
        tasks_pending: pending,
        hours_logged: hours,
        completion_rate: completionRate,
        on_time_rate: 94,
      };
    });

    return {
      kpis: {
        total_members: totalMembers,
        active_members: activeMembers,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completed_today: 3,
        pending_approvals: pendingApprovals,
        active_clients: activeClients,
        total_clients: totalClients,
        active_leads: activeLeads,
        pipeline_value: pipelineValue,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        approval_rate: approvalRate,
        rejection_rate: rejectionRate,
      },
      lead_sources: leadSources,
      weekly_productivity: weeklyProductivity,
      member_productivity: memberProductivity,
      recent_activity: this.auditLogs.slice(0, 8),
    };
  }
}

export const mockStore = new MockStore();
