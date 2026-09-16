export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member';
  role_id?: string;
  designation?: string;
  phone?: string;
  avatar_url?: string;
  is_active?: number;
  target_points: number;
  total_points?: number;
  performance_percentage?: number;
  performance_level?: string;
  completed_tasks?: number;
  pending_tasks?: number;
  on_time_rate?: number;
  created_at?: string;
  badges?: Achievement[];
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by_name?: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  avatar_url?: string;
  comment: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_name?: string;
  assigned_to_id: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by_id: string;
  created_by_name?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  required_deliverables?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  rejection_reason?: string;
  progress_percentage: number;
  submission_notes?: string;
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface WorkReportAttachment {
  id: string;
  report_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
}

export interface WorkReport {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_designation?: string;
  task_id?: string;
  task_title?: string;
  client_id?: string;
  client_name?: string;
  report_date: string;
  work_description: string;
  completed_items?: string;
  implemented_items?: string;
  hours_worked: number;
  progress_percentage: number;
  additional_notes?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
  attachments?: WorkReportAttachment[];
}

export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  phone?: string;
  email?: string;
  location?: string;
  industry?: string;
  service?: string;
  budget: number;
  assigned_member_id?: string;
  assigned_member_name?: string;
  assigned_member_email?: string;
  status: 'Lead' | 'Prospect' | 'Active' | 'Completed' | 'Inactive';
  source?: string;
  notes?: string;
  next_follow_up?: string;
  total_projects?: number;
  total_tasks?: number;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  source: 'Instagram' | 'WhatsApp' | 'Website' | 'Referral' | 'LinkedIn' | 'Cold Outreach' | 'Other';
  industry?: string;
  interested_service?: string;
  budget: number;
  assigned_to_id?: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  stage: 'NEW_LEAD' | 'CONTACTED' | 'INTERESTED' | 'MEETING' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  follow_up_date?: string;
  notes?: string;
  created_at: string;
}

export interface ProjectMember {
  membership_id: string;
  role_in_project: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  designation?: string;
}

export interface Project {
  id: string;
  client_id: string;
  client_name?: string;
  client_contact?: string;
  project_name: string;
  description?: string;
  budget: number;
  start_date?: string;
  deadline?: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold' | 'Cancelled';
  progress_percentage: number;
  total_tasks?: number;
  completed_tasks?: number;
  members?: ProjectMember[];
  created_at: string;
}

export interface PointRule {
  id: string;
  rule_key: string;
  name: string;
  description?: string;
  points_delta: number;
  is_active: number;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  user_name?: string;
  points: number;
  reason: string;
  task_id?: string;
  report_id?: string;
  admin_id?: string;
  admin_name?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon_name: string;
  points_reward: number;
  awarded_at?: string;
  awarded_reason?: string;
  awarded_by_name?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  email: string;
  designation?: string;
  role: string;
  points: number;
  target_points: number;
  performance_percentage: number;
  performance_level: string;
  tasks_completed: number;
  achievements: { id: string; code: string; title: string; icon_name: string }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'TASK' | 'REPORT' | 'POINTS' | 'PROJECT' | 'LEAD' | 'SYSTEM';
  link_url?: string;
  is_read: number;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  created_at: string;
}
