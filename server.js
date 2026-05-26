require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reelRoutes = require('./routes/reelRoutes');
const caseRoutes = require('./routes/caseRoutes');
const planRoutes = require('./routes/planRoutes');
const chatRoutes = require('./routes/chatRoutes');
const healthMetricRoutes = require('./routes/healthMetricRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health-metrics', healthMetricRoutes);
app.use('/api/reminders', reminderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cogniva backend running with Ollama AI' });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════╗
║   🔥 COGNIVA BACKEND RUNNING! 🔥                    ║
╠══════════════════════════════════════════════════════╣
║   📡 Server: http://localhost:${PORT}                ║
║   🗄️  Database: MongoDB                             ║
║   🤖 AI Model: Llama 3.2 (Ollama)                   ║
║   ✅ All routes active                              ║
╚══════════════════════════════════════════════════════╝
      `);
    });
  })
  .catch(err => console.error('❌ DB error:', err.message));