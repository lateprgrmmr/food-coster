import express, { Router } from 'express';
import db from '../db';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';
import { vendors, contacts } from '../db/schema';

const router: Router = express.Router();

// vendor fields + flattened contact fields (null when no contact)
const vendorSelect = {
    id: vendors.id,
    organizationId: vendors.organizationId,
    name: vendors.name, 
    description: vendors.description,
    contactId: vendors.contactId,
    contactFname: contacts.fname,
    contactLname: contacts.lname,
    contactEmail: contacts.email,
    contactPhone: contacts.phone,
    contactTitle: contacts.title,
};

router.get('/', authenticate, async (req, res) => {
    try {
        const isSuperUser = req.user!.role === 'superuser';
        const results = await db.select(vendorSelect)
            .from(vendors)
            .leftJoin(contacts, eq(vendors.contactId, contacts.id))
            .where(isSuperUser ? undefined : eq(vendors.organizationId, req.user!.organizationId))
            .orderBy(vendors.name);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Vendor ID must be a string' });
        }
        const isSuperUser = req.user!.role === 'superuser';
        const [vendor] = await db.select(vendorSelect)
            .from(vendors)
            .leftJoin(contacts, eq(vendors.contactId, contacts.id))
            .where(eq(vendors.id, id!));
        if (!vendor || (!isSuperUser && vendor.organizationId !== req.user!.organizationId)) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authenticate, async (req, res) => {
    const { name, description, contactFname, contactLname, contactEmail, contactPhone, contactTitle } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Vendor name is required' });
    }
    try {
        const vendor = await db.transaction(async (tx) => {
            let contactId: string | null = null;
            if (contactFname && contactLname) {
                const [c] = await tx.insert(contacts).values({
                    fname: contactFname,
                    lname: contactLname,
                    email: contactEmail || null,
                    phone: contactPhone || null,
                    title: contactTitle || null,
                }).returning();
                contactId = c!.id;
            }
            const [v] = await tx.insert(vendors).values({
                organizationId: req.user!.organizationId,
                name,
                description: description || null,
                contactId,
            }).returning();
            return v;
        });
        res.status(201).json(vendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, description, contactFname, contactLname, contactEmail, contactPhone, contactTitle } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Vendor name is required' });
    }
    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Vendor ID must be a string' });
    }
    try {
        const isSuperUser = req.user!.role === 'superuser';
        const [existing] = await db.select({
            organizationId: vendors.organizationId,
            contactId: vendors.contactId,
        }).from(vendors).where(eq(vendors.id, id!));
        if (!existing || (!isSuperUser && existing.organizationId !== req.user!.organizationId)) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        await db.transaction(async (tx) => {
            let contactId = existing.contactId;
            if (contactFname && contactLname) {
                const contactValues = {
                    fname: contactFname,
                    lname: contactLname,
                    email: contactEmail || null,
                    phone: contactPhone || null,
                    title: contactTitle || null,
                };
                if (contactId) {
                    await tx.update(contacts)
                        .set({ ...contactValues, updatedAt: new Date() })
                        .where(eq(contacts.id, contactId));
                } else {
                    const [c] = await tx.insert(contacts).values(contactValues).returning();
                    contactId = c!.id;
                }
            }
            await tx.update(vendors)
                .set({ name, description: description || null, contactId, updatedAt: new Date() })
                .where(eq(vendors.id, id!));
        });
        res.json({ message: 'Vendor updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;