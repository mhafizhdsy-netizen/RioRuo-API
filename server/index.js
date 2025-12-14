import express from 'express';
import cors from 'cors';
import router from './routes/routes.js'; // Assuming routes.js is now in server/routes/

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// This root endpoint will only be hit if someone directly accesses https://rioruo.vercel.app/api
// The frontend will use the /otakudesu/v1/... path, which Vercel rewrites to /api/v1/...
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Otakudesu API root for serverless function. Use /v1/* endpoints.',
    endpoints: '/v1/*' 
  });
});

// Mount the main router directly as Vercel rewrites will strip the /otakudesu prefix
app.use(router); 

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
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