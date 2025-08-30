import { query } from '@/db/database-connect';
// middleware/auth.ts - Authentication middleware
import { NextRequest } from 'next/server';


export interface AuthUser {
  id: string;
  role: string;
  societyId: string;
  firstName: string;
  lastName: string;
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    // This is a simplified example - replace with your actual auth logic
    const authHeader = request.headers.get('authorization');
    const sessionId = request.headers.get('x-session-id');
    
    if (!authHeader && !sessionId) {
      return null;
    }

    // Example: Extract user from session or JWT token
    // Replace this with your actual authentication logic
    const queryText = `
      SELECT u.id, u.role, u.society_id, u.first_name, u.last_name
      FROM users u
      INNER JOIN user_sessions us ON u.id = us.user_id
      WHERE us.refresh_token = $1 AND us.is_deleted = false
    `;

    const result = await query(queryText, [sessionId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      role: user.role,
      societyId: user.society_id,
      firstName: user.first_name,
      lastName: user.last_name
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return handler(request, { user, ...args });
  };
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return handler(request, { user, ...args });
  };
}