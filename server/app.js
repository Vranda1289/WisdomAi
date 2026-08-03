import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Sample Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wisdom AI Backend Running"
  });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
