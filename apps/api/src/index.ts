import express from 'express';
import { sql, eq } from 'drizzle-orm';
import db from './db';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoices';
import { authenticate } from './middleware/auth';
import cors from 'cors';
import { users, contacts } from './db/schema';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/invoices', invoiceRoutes);

app.get('/health', async (req, res) => {
  const healthCheck = await db.execute(sql`SELECT 1;`);
  res.json({ status: 'ok', data: healthCheck.rows });
});

app.get('/me', authenticate, async (req, res) => {
  const [me] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      organizationId: users.organizationId,
      contactId: contacts.id,
      fname: contacts.fname,
      lname: contacts.lname,
      contactEmail: contacts.email,
      phone: contacts.phone,
      title: contacts.title,
    })
    .from(users)
    .innerJoin(contacts, eq(users.contactId, contacts.id))
    .where(eq(users.id, req.user!.id));
  res.json({ user: me });
});

app.patch('/me', authenticate, async (req, res) => {
  const { fname, lname, email, phone } = req.body;
  if (!fname || !lname) {
    return res.status(400).json({ message: 'First and last name are required' });
  }
  try {
    const [me] = await db.select({
      contactId: users.contactId,
    })
      .from(users)
      .where(eq(users.id, req.user!.id));

    await db.update(contacts)
      .set({ fname, lname, email: email || null, phone: phone || null, updatedAt: new Date() })
      .where(eq(contacts.id, me!.contactId));
    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(5521, () => {
  console.log('Server is running on port 5521');
});