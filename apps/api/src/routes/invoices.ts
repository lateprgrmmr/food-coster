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
            .leftJoin(subCategories, eq(invoiceItems.subCategoryId, subCategories.id))
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

router.post('/', authenticate, async (req, res) => {
    const { vendorId, locationId, invoiceNumber, invoiceDate, items } = req.body;
    if (!vendorId || !locationId) {
        return res.status(400).json({ message: 'Vendor and location are required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'At least one line item is required' });
    }
    try {
        const isSuperUser = req.user!.role === 'superuser';
        const orgId = req.user!.organizationId;

        // vendor + location must both belong to the user's org (superuser exempt)
        const [vendor] = await db.select({ organizationId: vendors.organizationId })
            .from(vendors).where(eq(vendors.id, vendorId));
        const [location] = await db.select({ organizationId: locations.organizationId })
            .from(locations).where(eq(locations.id, locationId));
        if (!vendor || !location ||
            (!isSuperUser && (vendor.organizationId !== orgId || location.organizationId !== orgId))) {
            return res.status(400).json({ message: 'Invalid vendor or location' });
        }

        const invoice = await db.transaction(async (tx) => {
            const [inv] = await tx.insert(invoices).values({
                locationId,
                vendorId,
                importedBy: req.user!.id,
                invoiceNumber: invoiceNumber || null,
                invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
                status: 'pending',
            }).returning();

            await tx.insert(invoiceItems).values(
                items.map((item: { description?: string; quantity: string | number; unitPrice: string | number }) => {
                    const quantity = Number(item.quantity) || 0;
                    const unitPrice = Number(item.unitPrice) || 0;
                    return {
                        invoiceId: inv!.id,
                        description: item.description || null,
                        quantity: String(quantity),
                        unitPrice: unitPrice.toFixed(2),
                        totalPrice: (quantity * unitPrice).toFixed(2),
                    };
                })
            );
            return inv; 
        }); 
        res.status(201).json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    } 
});


export default router;