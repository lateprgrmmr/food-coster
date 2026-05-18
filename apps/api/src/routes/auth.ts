import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db';
import { organizations, users, userSessions, appTokens } from '../db/schema';
import { randomBytes } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password, organizationName } = req.body;
    if (!email || !password || !organizationName) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.transaction(async (tx) => {
            const [organization] = await tx.insert(organizations).values({ name: organizationName }).returning();
            const [user] = await tx.insert(users).values({ email, password: hashedPassword, organizationId: organization!.id }).returning();
            return { organization, user };
        });
        const sessionToken = randomBytes(32).toString('hex');
        await db.insert(userSessions).values({ userId: result.user!.id, sessionToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }); // 30 days
        return res.status(201).json({ token: sessionToken, userId: result.user!.id });
    } catch (error) {
        if ((error as any).cause?.code === '23505') {
            return res.status(409).json({ message: 'Email already exists' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const sessionToken = randomBytes(32).toString('hex');
        await db.insert(userSessions).values({ userId: user.id, sessionToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }); // 30 days
        return res.status(200).json({ token: sessionToken, userId: user.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (user) {
            const resetToken = randomBytes(32).toString('hex');
            await db.insert(appTokens).values({
                userId: user.id,
                token: resetToken,
                type: 'password_reset',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
            });
            console.log(`[password reset] token for ${email}: ${resetToken}`);
        }
        // Always return success to avoid leaking which emails are registered
        return res.status(200).json({ message: 'If that email exists, a reset token has been printed to the server console.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }
    try {
        const [resetToken] = await db.select().from(appTokens).where(
            and(
                eq(appTokens.token, token),
                eq(appTokens.type, 'password_reset'),
                gt(appTokens.expiresAt, new Date()),
                isNull(appTokens.usedAt),
            )
        );
        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.transaction(async (tx) => {
            await tx.update(users).set({ password: hashedPassword }).where(eq(users.id, resetToken.userId));
            await tx.update(appTokens).set({ usedAt: new Date() }).where(eq(appTokens.id, resetToken.id));
            await tx.delete(userSessions).where(eq(userSessions.userId, resetToken.userId));
        });
        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', authenticate, async (req, res) => {
    const token = req.headers.authorization!.slice(7);
    await db.delete(userSessions).where(eq(userSessions.sessionToken, token));
    return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;