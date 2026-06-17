import express, { Router } from 'express';
import db from '../db';
import { eq, sql } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';
import { invoices, locations, vendors, invoiceItems, subCategories } from '../db/schema';

const router: Router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const isSuperUser = req.user!.role === 'superuser';
        const results = await db.select({
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
            invoiceDate: invoices.invoiceDate,
            status: invoices.status,
            vendorName: vendors.name,
            locationName: locations.name,
            itemCount: sql<number>`COUNT(${invoiceItems.id})::int`,
            total: sql<string>`COALESCE(SUM(${invoiceItems.totalPrice}), 0)`,
        }).from(invoices)
            .innerJoin(locations, eq(invoices.locationId, locations.id))
            .innerJoin(vendors, eq(invoices.vendorId, vendors.id))
            .leftJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
            .where(isSuperUser ? undefined : eq(locations.organizationId, req.user!.organizationId))
            .groupBy(invoices.id, locations.id, vendors.id);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', authenticate, async (req, res) => { 
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Invoice ID is required' });
        }
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Invoice ID must be a string' });
        }
        const isSuperUser = req.user!.role === 'superuser';
        const [invoice] = await db.select({
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
            invoiceDate: invoices.invoiceDate,
            status: invoices.status,
            vendorName: vendors.name,
            locationName: locations.name,
            organizationId: locations.organizationId,
        }).from(invoices)
            .innerJoin(locations, eq(invoices.locationId, locations.id))
            .innerJoin(vendors, eq(invoices.vendorId, vendors.id))
            .where(eq(invoices.id, id));
        if (!invoice || (!isSuperUser && invoice.organizationId !== req.user!.organizationId)) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const items = await db.select({
            id: invoiceItems.id,
            description: invoiceItems.description,
            quantity: invoiceItems.quantity,
            unitPrice: invoiceItems.unitPrice,
            totalPrice: invoiceItems.totalPrice,
            subCategoryName: subCategories.name,
        }).from(invoiceItems)
            .innerJoin(subCategories, eq(invoiceItems.subCategoryId, subCategories.id))
            .where(eq(invoiceItems.invoiceId, id));
        
        res.json({
            ...invoice,
            items,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;