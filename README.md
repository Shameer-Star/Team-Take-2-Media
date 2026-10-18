# COCO MEDIA OS
**Internal Business & Work Operations Platform**  
*Built for: COCO MEDIA*  
*Theme: Minimalist Black, White, & Red Signature UI*  
*Tagline: "One Workspace. Business Focused. Complete Control."*

---

## 🚀 Overview
**COCO MEDIA OS** is a centralized, production-grade business and work operations platform developed specifically for **COCO MEDIA**. Designed with high visual contrast in sleek black, white, and red, it streamlines high-value work and business workflows: task execution, daily work logs, client CRM accounts, sales leads pipeline, project portfolio management, team coordination, and business intelligence analytics.

---

## 🔑 Initial User Credentials
Registered company accounts for sign-in:

### Administrators (Full Executive Operations & Review Access):
1. **Naveed** (`naveed@cocomedia.com`) — Password: `Naveed123.` (Managing Director / Admin)
2. **Shameer** (`shameer@cocomedia.com`) — Password: `Shameer123.` (Operations Director / Admin)
3. **Rayyan** (`rayyan@cocomedia.com`) — Password: `Rayyan123.` (Creative Director / Admin)

### Team Members (Work Execution & Daily Logs):
4. **Alhameed** (`alhameed@cocomedia.com`) — Password: `Hameed123.` (Senior Video Editor & Media Specialist)
5. **Sathar** (`sathar@cocomedia.com`) — Password: `Sathar123.` (Lead UI/UX Designer)
6. **Asfar** (`asfar@cocomedia.com`) — Password: `Asfar123.` (Video & Motion Producer)
7. **Hilal** (`hilal@cocomedia.com`) — Password: `Hilal123.` (Digital Marketing Strategist)
8. **Sivabalan** (`sivabalan@cocomedia.com`) — Password: `Sivabalan123.` (Brand & Content Specialist)

---

## 🎨 Design System: Black, White & Red
- **Backgrounds**: Deep True Black (`#050505`) and Dark Charcoal (`#0e0e11`, `#18181b`)
- **Typography & Panels**: Crisp High-Contrast White (`#ffffff`, `#f4f4f5`) with subtle borders
- **Signature Accents**: Vibrant Red (`#E50914`, `#ff1723`, glowing ambient halos)
- **Official Brand Mark**: Interlocking dual rings with solid red centers and geometric "MEDIA" typography.

---

## 🏛️ Business-Focused Core Modules

### 1. Executive & Member Dashboards
- **Executive View**: Live business KPIs, work velocity metrics, pending approvals queue, acquisition channels, and team production matrix.
- **Member View**: Active deliverable statuses, daily work report status, active client projects, and weekly hours logged.

### 2. Task Management & Work Review
- Deliverable Lifecycle: `TO DO` → `IN PROGRESS` → `SUBMITTED` → `APPROVED` → `COMPLETED`
- Revision Lifecycle: `SUBMITTED` → `REJECTED` (with mandatory feedback) → `IN PROGRESS` → `RESUBMITTED`
- Priority, progress %, deadlines, and project associations.

### 3. Daily Work Reports
- Mandatory daily log capturing: Task, Client, What did you work on?, What did you complete?, What did you implement?, and Hours worked.
- Management Review: One-click Approve or Reject with feedback.

### 4. Client CRM & Accounts
- Client directory, contracted services, budgets, contact persons, phone/email, and account statuses.

### 5. Sales CRM Leads Pipeline
- 8-stage Kanban sales pipeline: `NEW LEAD` → `CONTACTED` → `INTERESTED` → `MEETING` → `PROPOSAL SENT` → `NEGOTIATION` → `WON` → `LOST`.
- One-click "Convert to Client" upon winning deals.

### 6. Project Management
- Full portfolio tracking: deadlines, budgets, completion %, and assigned specialists.

### 7. Team Directory
- Role management, designation, phone numbers, and operational assignments.

### 8. Compliance & Security Audit Trail
- Transparent audit log tracking logins, creations, modifications, approvals, and reviews.

---

## ⚡ Auto Deploy to Vercel

The platform is pre-configured for automated, zero-configuration deployment to **Vercel**:

1. **Vercel Configuration (`vercel.json`)**:
   ```json
   {
     "version": 2,
     "buildCommand": "cd client && npm run build",
     "outputDirectory": "client/dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

2. **Self-Healing Persistence**:
   - Includes a fail-proof localStorage persistence layer (`mockData.ts` & `api.ts`).
   - When deployed to Vercel without a persistent backend server, all endpoints (login, tasks, reports, leads, clients, team members) continue to function with full interactivity and local persistence!

3. **Deploy with 1 Click**:
   - Push repository to GitHub/GitLab.
   - Import project into [Vercel](https://vercel.com).
   - Click **Deploy**! Vercel automatically builds `client/dist` and hosts the platform globally.

---

## 🏃 Running Locally

```bash
# Run both Backend Server (port 5000) and Frontend Client (port 5173) concurrently:
npm run dev
```

Or run individually:
```bash
# Terminal 1:
cd server
npm run dev

# Terminal 2:
cd client
npm run dev
```

Visit: **`http://localhost:5173`**
