import express from 'express';

// build a dummy express endpoint that returns a simple message
const app = express();

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(5521, () => {
    console.log('Server is running on port 5521');
});