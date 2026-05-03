import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db';
import { organizations, users, userSessions } from '../db/schema';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

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

export default router;