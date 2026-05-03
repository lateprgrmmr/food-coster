import express from 'express';
import { sql } from 'drizzle-orm';
import db from './db';
import authRoutes from './routes/auth';
import { authenticate } from './middleware/auth';                                                                                                                                                                                                                        
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/health', async (req, res) => {
    const healthCheck = await db.execute(sql`SELECT 1;`);
    res.json({ status: 'ok', data: healthCheck.rows });
});

app.get('/me', authenticate, (req, res) => {                                                                                                                                                                                                                             
  res.json({ user: req.user });
});

app.listen(5521, () => {
    console.log('Server is running on port 5521');
});