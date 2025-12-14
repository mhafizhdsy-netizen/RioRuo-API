import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DIAGNOSTIC LOGGING: Temporarily log incoming request URLs to Vercel logs
// Remove this middleware once routing issues are resolved.
app.use((req, res, next) => {
  console.log(`[Diagnostic Log] Incoming request URL received by Express: ${req.url}`);
  next();
});

// Mount the main router directly.
// Vercel's rewrite rules handle the '/api' prefix, so this Express app
// receives paths *after* the '/api' prefix has been conceptually handled.
// For example, /otakudesu/v1/home -> /api/v1/home (by vercel.json) -> this app receives /v1/home
app.use(router); 

// 404 Handler for anything not caught by the main router
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found within the Otakudesu API: ${req.method} ${req.originalUrl}. Check your route definitions.`,
    hint: 'This means the request reached the Express app, but no handler matched the specific URL after /v1.'
  });
});

// Export the Express API for Vercel
export default app;

// Start Server (Only for local development)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}