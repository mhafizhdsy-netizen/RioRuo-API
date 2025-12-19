
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import routes from './routes/routes.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT ?? 3000;

// Enable 'trust proxy' for Vercel/proxies
app.set('trust proxy', 1);

// 1. Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Optimized CORS Configuration
app.use(cors({
    origin: '*', // Allows all for the playground convenience
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true
}));

// 3. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiter Configuration
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100, 
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
    message: {
        status: 'Error',
        message: 'Too many requests from this IP, please try again after 15 minutes',
        hint: 'We implement rate limiting to protect our upstream providers.'
    },
    validate: { xForwardedForHeader: false } 
});

app.use(limiter);

// Main Router
app.use('/', routes);

app.listen(port, () => {
    console.log(`App is listening on port ${port}, http://localhost:${port}`);
});

export default app;
