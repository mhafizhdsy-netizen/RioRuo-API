import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DIAGNOSTIC LOGGING
app.use((req, res, next) => {
  console.log(`[Diagnostic Log] Incoming request URL: ${req.url}`);
  next();
});

// IMPORTANT: Mount the router to handle multiple potential prefixes.
// When Vercel rewrites /otakudesu/v1/home -> /api/index.js, the req.url seen by Express
// might still contain the full path depending on the execution context.
// By mounting on multiple paths, we ensure the internal router (which expects /v1) gets hit.

app.use('/otakudesu', router); // Handles: /otakudesu/v1/home
app.use('/api', router);       // Handles: /api/v1/home (if accessed directly)
app.use('/', router);          // Handles: /v1/home (Local development)

// 404 Handler for anything not caught by the router
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found within the Otakudesu API: ${req.method} ${req.originalUrl}.`,
    hint: 'This means the request reached Express, but the router paths (mounted at /otakudesu, /api, or /) did not match the remaining URL.'
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