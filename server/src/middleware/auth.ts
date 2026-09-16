import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne, runQuery } from '../database';
import { v4 as uuidv4 } from 'uuid';

export const JWT_SECRET = process.env.JWT_SECRET || 'take_two_os_secret_key_2026_production_grade';

export interface AuthenticatedUser {
  id: string;
  role: string;
  roleId: string;
  name: string;
  email: string;
  designation?: string;
  target_points: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = queryOne(`
      SELECT u.id, u.name, u.email, u.designation, u.is_active, u.target_points, r.name as role, r.id as roleId
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [decoded.id]);

    if (!user || user.is_active === 0) {
      return res.status(403).json({ error: 'User account is inactive or not found' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      roleId: user.roleId,
      name: user.name,
      email: user.email,
      designation: user.designation,
      target_points: user.target_points || 100
    };

    next();
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privilege required for this action' });
  }
  next();
}

export function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  description: string,
  metadata?: any
) {
  try {
    runQuery(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        userId,
        action,
        entityType,
        entityId,
        description,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'TASK' | 'REPORT' | 'POINTS' | 'PROJECT' | 'LEAD' | 'SYSTEM' = 'SYSTEM',
  linkUrl?: string
) {
  try {
    runQuery(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [uuidv4(), userId, title, message, type, linkUrl || null]
    );
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
