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
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Otakudesu API is running!',
    endpoints: '/otakudesu/v1/*' // Updated endpoint path
  });
});

app.use('/otakudesu', router); // Mount the main router under /otakudesu

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
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