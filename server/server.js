require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const setupSocketIO = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://*.vercel.app',
  'https://*.onrender.com'
];

// ✅ CORS config (fixed)
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin.includes('localhost') ||
      origin.includes('vercel.app') ||
      origin.includes('onrender.com')
    ) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup (with same CORS)
const io = new Server(server, {
  cors: corsOptions,
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  console.log("✅ Health check hit");
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket setup
try {
  setupSocketIO(io);
  console.log("📡 Socket.IO initialized");
} catch (err) {
  console.error("❌ Socket.IO Error:", err);
}

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Server start
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});