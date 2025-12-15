import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/routes.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
// Mount the API router to handle API calls
app.use('/otakudesu', router);
app.use('/api', router);

// --- Serve Frontend ---
// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// --- 404 Handler for API ---
// This will only be reached if a path starts with /otakudesu or /api but is not found by the router.
// It should be placed after API routes but before the frontend catchall.
app.use('/otakudesu|/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found within the API: ${req.method} ${req.originalUrl}.`,
  });
});

// Export the Express API for Vercel (though this setup is for Docker/Railway)
export default app;

// Start Server for Docker/Railway/Local
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}