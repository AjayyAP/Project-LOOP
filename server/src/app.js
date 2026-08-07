import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import channelImportRoutes from './routes/channelImportRoutes.js';
import aiInsightsRoutes from './routes/aiInsightsRoutes.js';
import workspaceAssistantRoutes from './routes/workspaceAssistantRoutes.js';
import vocReportRoutes from './routes/vocReportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import feedbackAiRoutes from './routes/feedbackAiRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';

dotenv.config();

const app = express();
const allowedOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin is not allowed.'));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', channelImportRoutes);
app.use('/api', aiInsightsRoutes);
app.use('/api', workspaceAssistantRoutes);
app.use('/api', vocReportRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', feedbackAiRoutes);
app.use('/api/workspaces', workspaceRoutes);

app.use((error, request, response, next) => {
  console.error(error);

  if (error.name === 'CastError') {
    return response.status(400).json({ success: false, message: 'Invalid request data.' });
  }

  return response.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

export default app;
