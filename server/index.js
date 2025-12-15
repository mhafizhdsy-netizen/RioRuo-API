import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import 'dotenv/config';
const app = express();
const port = process.env.PORT ?? 3000;
app.use(cors());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl}`);

    next();
});

// FIX: Mount the main router under the `/otakudesu` prefix.
// The Vercel environment and the frontend API service both use this prefix.
// This ensures that the Express router correctly matches the incoming request paths.
app.use('/otakudesu', routes);

app.listen(port, () => {
    console.log(`App is listening on port ${port}, http://localhost:${port}`);
});
export default app;