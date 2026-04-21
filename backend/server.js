const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const User = require('./src/models/User');

dotenv.config();

const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bloodlife';
const JWT_SECRET = process.env.JWT_SECRET || 'bloodlife-secret-change-in-production';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    app.set('io', io);

    io.use(async (socket, next) => {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('role city isBlocked');
        if (!user) return next(new Error('User not found'));
        if (user.isBlocked) return next(new Error('User blocked'));
        socket.userId = user._id.toString();
        socket.role = user.role;
        socket.city = user.city ? user.city.trim().toLowerCase() : '';
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Socket connected', socket.id, socket.role);

      if (socket.role === 'donor' && socket.city) {
        socket.join(`city:${socket.city}`);
      }
      if (socket.role === 'receiver') {
        socket.join(`user:${socket.userId}`);
      }
      if (socket.role === 'admin') {
        socket.join('admins');
      }

      socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
