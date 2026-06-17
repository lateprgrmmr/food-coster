import { NextFunction, Request, Response } from "express";
import db from "../db";
import { users, userSessions } from "../db/schema";
import { eq } from "drizzle-orm";

declare global {                                                                                                                                                                                                                                                         
    namespace Express {                                                                                                                                                                                                                                                    
      interface Request {
        user?: { id: string; organizationId: string; email: string, role: string };                                                                                                                                                                                                      
      }           
    }
}
  
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;                                                                                                                                                                                                                            
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionToken, token));
    if (!session || session.expiresAt < new Date()) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    req.user = { id: user.id, organizationId: user.organizationId, email: user.email, role: user.role };
    next();
}