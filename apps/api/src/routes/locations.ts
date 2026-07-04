import express, { Router } from 'express';
import db from '../db';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';
import { locations } from '../db/schema';

const router: Router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const isSuperUser = req.user!.role === 'superuser';
        const results = await db.select({
            id: locations.id,
            name: locations.name,
            address: locations.address,
        }).from(locations)
            .where(isSuperUser ? undefined : eq(locations.organizationId, req.user!.organizationId));
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
