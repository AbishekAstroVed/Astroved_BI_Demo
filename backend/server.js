import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { seedDatabase } from './seed.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { startBackupScheduler, startReportCronJobs, startAlertCronJobs } from './controllers/adminController.js';
import { connectMSSQL } from './config/mssql.js';

// Load Environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(async () => {
  // Connect to MSSQL
  await connectMSSQL();
  
  // Auto-seed database if empty
  await seedDatabase();
  // Start the background database backup scheduler
  startBackupScheduler();
  // Start the automated report email dispatcher
  startReportCronJobs();
  // Start the Slack alert dispatcher
  startAlertCronJobs();
});

const app = express();

// Middlewares
app.use(cors());
// Set JSON limit higher to accommodate CSV/JSON bulk imports
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AstroVed BI API Server is running.' });
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
// Trigger reload
