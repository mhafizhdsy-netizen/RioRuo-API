
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import routes from './routes/routes.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT ?? 3000;

// FIX: Enable 'trust proxy' so express-rate-limit works correctly behind Vercel's proxy.
// Without this, X-Forwarded-For headers cause a ValidationError.
app.set('trust proxy', 1);

// 1. Security Headers
app.use(helmet());

// 2. CORS Configuration
app.use(cors());

// 3. Rate Limiter Configuration
// Limits each IP to 100 requests per 15 minutes.
// Standard headers are included so clients know their limits.
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: {
        status: 'Error',
        message: 'Too many requests from this IP, please try again after 15 minutes',
        hint: 'We implement rate limiting to protect our upstream providers.'
    },
    // Explicitly validate to prevent the specific error shown in logs if trust proxy misses
    validate: { xForwardedForHeader: false } 
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use((req, res, next) => {
    // Clean logging to avoid clutter
    // console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl}`);
    next();
});

// FIX: Mount the main router at the root level.
// The Vercel configuration now routes everything to this app, and we removed the '/otakudesu' prefix.
app.use('/', routes);

app.listen(port, () => {
    console.log(`App is listening on port ${port}, http://localhost:${port}`);
});
export default app;
