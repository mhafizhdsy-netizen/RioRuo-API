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

// FIX: Mount the main router at the root level.
// The Vercel configuration now routes everything to this app, and we removed the '/otakudesu' prefix.
app.use('/', routes);

app.listen(port, () => {
    console.log(`App is listening on port ${port}, http://localhost:${port}`);
});
export default app;