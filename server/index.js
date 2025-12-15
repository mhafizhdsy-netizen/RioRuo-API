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

// FIX: Mount the main routes under the /otakudesu path to match Vercel's rewrite rule.
// This ensures that Express correctly handles paths like /otakudesu/v1/home.
app.use('/otakudesu', routes);

app.listen(port, () => {
    console.log(`App is listening on port ${port}, http://localhost:${port}`);
});
export default app;