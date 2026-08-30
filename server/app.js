import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reflection', reflectionRoutes);
app.use('/api/journal', journalRoutes);

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
