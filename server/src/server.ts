import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './database';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import reportRoutes from './routes/reportRoutes';
import pointRoutes from './routes/pointRoutes';
import achievementRoutes from './routes/achievementRoutes';
import clientRoutes from './routes/clientRoutes';
import leadRoutes from './routes/leadRoutes';
import projectRoutes from './routes/projectRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import auditRoutes from './routes/auditRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files securely
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/ai-insights', aiRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'TAKE TWO OS',
    company: 'Team Take Two Media',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 TAKE TWO OS Backend Server Running on port ${PORT}`);
      console.log(`🏢 Team Take Two Media - Internal Business Platform`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`📁 Uploads:  http://localhost:${PORT}/uploads`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start TAKE TWO OS server:', error);
    process.exit(1);
  }
}

startServer();
