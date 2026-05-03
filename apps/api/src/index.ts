import express from 'express';
import { sql } from 'drizzle-orm';
import db from './db';


const app = express();

app.get('/health', async (req, res) => {
    const healthCheck = await db.execute(sql`SELECT 1;`);
    res.json({ status: 'ok', data: healthCheck.rows });
});

app.listen(5521, () => {
    console.log('Server is running on port 5521');
});