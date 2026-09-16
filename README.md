# TAKE TWO OS
**Internal Business & Team Management Platform**  
*Built for: Team Take Two Media*  
*Tagline: "One Workspace. One Team. Complete Control."*

---

## 🚀 Overview
**TAKE TWO OS** is a centralized, production-grade business and team operations platform developed specifically for **Team Take Two Media**. It provides company leadership with comprehensive control over teams, task execution, daily work reports, client relationships, sales leads, projects, approvals, gamified points, achievements, and analytics.

---

## 🔑 Initial User Credentials
All user passwords in the database are hashed with `bcryptjs`. Initial demo accounts are pre-configured and accessible via 1-click on the login screen:

### Administrators (Full Operations & Finance Access):
1. **Naveed** (`naveed@taketwomedia.com`) — Password: `Naveed123.`
2. **Shameer** (`shameer@taketwomedia.com`) — Password: `Shameer123.`
3. **Rayyan** (`rayyan@taketwomedia.com`) — Password: `Rayyan123.`

### Team Members:
4. **Hameed** (`hameed@taketwomedia.com`) — Password: `Hameed123.` (Senior Full-Stack Dev)
5. **Sathar** (`sathar@taketwomedia.com`) — Password: `Sathar123.` (Lead UI/UX Designer)
6. **Asfar** (`asfar@taketwomedia.com`) — Password: `Asfar123.` (Video & Motion Producer)
7. **Hilal** (`hilal@taketwomedia.com`) — Password: `Hilal123.` (Digital Marketing Strategist)
8. **Sivabalan** (`sivabalan@taketwomedia.com`) — Password: `Sivabalan123.` (Brand & Content Specialist)

---

## 🛠️ Technology Stack
- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Lucide React + Recharts + Canvas Confetti
- **Backend**: Node.js + Express + REST APIs + JWT Auth + RBAC Middleware + Multer File Storage
- **Database**: Relational SQLite WebAssembly engine (`sql.js`) with 17 normalized tables, UUID primary keys, foreign keys, triggers, and disk persistence (`server/take_two_os.db`)

---

## 🏛️ Core Modules & Features

### 1. Security & RBAC
- **Admin**: Full access to all operations, team settings, user management, approvals, points configuration, audit logs, and analytics.
- **Team Member**: Access restricted to assigned tasks, own daily reports, points ledger, leaderboard, and profile.
- Protected routes enforced both on client router and backend API middleware.

### 2. Task Management & Approval Workflow
- Task Lifecycle: `TO DO` → `IN PROGRESS` → `SUBMITTED` → `APPROVED` → `COMPLETED`
- Rejection Lifecycle: `SUBMITTED` → `REJECTED` (with mandatory reason) → `IN PROGRESS` → `RESUBMITTED`
- **Important Business Rule**: Points are **never** awarded immediately upon submission. Only awarded upon administrator approval!

### 3. Configurable Point System & Gamification
- Default Rules:
  - Task completed = `+10`
  - Early delivery bonus = `+5`
  - High / Urgent priority task = `+10`
  - Client work approved = `+10`
  - Daily report approved = `+2`
  - Exceptional work = `+15`
  - Missed deadline = `-5`
  - Rejected submission penalty = `-3`
- Total points are dynamically computed from the immutable `points_transactions` ledger (`SUM(points)`).
- Performance % = `(Earned Points / Target Points) × 100`
  - `0–39%`: Needs Improvement
  - `40–59%`: Developing
  - `60–74%`: Good
  - `75–89%`: Very Good
  - `90–100%+`: Outstanding

### 4. 100% Celebration Modal
- Confetti celebration modal triggers automatically when a member achieves $\ge 100\%$ performance target.

### 5. Daily Work Report
- Mandatory daily log capturing: Date, Task, Client, What did you work on?, What did you complete?, What did you implement?, Hours worked, Progress %, and Proof upload.
- Admin Review: Approve (awards +2 points) or Reject (with mandatory feedback reason).

### 6. Client CRM & Sales Pipeline
- Full account details, contracted services, and project/task breakdowns.
- 8-stage Kanban sales pipeline: `NEW LEAD` → `CONTACTED` → `INTERESTED` → `MEETING` → `PROPOSAL SENT` → `NEGOTIATION` → `WON` → `CLIENT` (or `LOST`).
- One-click "Convert to Client" button upon winning deals.

### 7. AI Insights
- Predictive analytics module with live database signals (team output velocity, overdue risk, high-converting channels).

### 8. Audit Trail
- Searchable compliance ledger tracking every login, creation, modification, approval, and rejection.

---

## 🏃 Running the Application Locally

From the root project directory:
```bash
# Run both Backend Server (port 5000) and Frontend Client (port 5173) concurrently:
npm run dev
```

Or run individually:
```bash
# In one terminal:
cd server
npm run dev

# In a second terminal:
cd client
npm run dev
```

Visit: **`http://localhost:5173`** in your browser.
