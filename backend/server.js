import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import lostFoundRoutes from './routes/lostFoundRoutes.js';
import ChatMessage from './models/ChatMessage.js';
import errorHandler from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(morgan('dev'));
const port = process.env.PORT || 5000;

// Security: Set secure headers with CSP that allows WebSockets and Cloudinary images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000", "http://127.0.0.1:5000"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "http://localhost:5000", "http://127.0.0.1:5000", "*"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);



// Security: Rate limiting to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use("/api", apiLimiter);

// Strict rate limiter for Authentication pathways (Login, Register, Password Resets)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login/registration attempts from this IP, please try again after 15 minutes" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgotpassword", authLimiter);
app.use("/api/auth/resetpassword", authLimiter);

// Rate limiter for Product Creation to avoid spam listings
const productCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // max 15 listings per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Listing limit exceeded. Please try again after an hour." },
});
app.use("/api/products", (req, res, next) => {
  if (req.method === "POST") {
    return productCreationLimiter(req, res, next);
  }
  next();
});

// Rate limiter for Chat routes
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // max 60 requests/messages per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages sent. Please slow down." },
});
app.use("/api/chat", chatLimiter);

// Wrap the express application in an HTTP server
const server = http.createServer(app);

// Initialize Socket.io with dynamic CORS origin reflection
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Reflect the incoming origin back to allow local network testing
      callback(null, origin || true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// CORS configuration for Express routes with dynamic origin reflection
app.use(cors({
  origin: (origin, callback) => {
    // Reflect the incoming origin back to allow local network testing
    callback(null, origin || true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
}));

// Cookie parser middleware
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security: NoSQL Injection sanitizer — Express 5 compatible
// express-mongo-sanitize cannot directly assign req.query in Express 5 (read-only getter).
// This middleware manually strips MongoDB operator keys ($, .) from body, params, and query.
const stripMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripMongoOperators);
  return Object.keys(obj).reduce((acc, key) => {
    if (!key.startsWith('$') && !key.includes('.')) {
      acc[key] = stripMongoOperators(obj[key]);
    }
    return acc;
  }, {});
};

app.use((req, res, next) => {
  if (req.method === 'OPTIONS' || (req.url && req.url.includes('socket.io'))) {
    return next();
  }
  // Sanitize body and params (writable in Express 5)
  if (req.body) req.body = stripMongoOperators(req.body);
  if (req.params) req.params = stripMongoOperators(req.params);
  // req.query is a read-only getter in Express 5, use Object.defineProperty
  if (req.query) {
    try {
      const sanitizedQuery = stripMongoOperators({ ...req.query });
      Object.defineProperty(req, 'query', {
        value: sanitizedQuery,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      // If defineProperty fails for any reason, skip query sanitization silently
    }
  }
  next();
});


// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Connect to MongoDB
connectDB().catch(console.error);

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api', chatRoutes);


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));
  
  // Serve frontend index.html for any other route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Basic route for testing in development
  app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
  });
}

// Keep track of active users online (userId -> Set of socket.ids)
const onlineUsers = new Map();

// Socket.io event handling for real-time messaging
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 1. Register User to track online status
  socket.on('registerUser', (userId) => {
    if (userId) {
      socket.userId = userId;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      
      // Broadcast updated online users list to everyone
      io.emit('onlineUsersList', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} registered online. Total online users: ${onlineUsers.size}`);
    }
  });

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
  });

  socket.on('chatMessage', async (data) => {
    const { conversationId, sender, receiver, message } = data;
    try {
      const newMessage = new ChatMessage({
        conversationId,
        sender,
        receiver,
        message,
        read: false
      });
      const savedMessage = await newMessage.save();
      
      const populatedMessage = await ChatMessage.findById(savedMessage._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");

      // Broadcast to all clients in the conversation room
      io.to(conversationId).emit('newMessage', populatedMessage);
      console.log(`Message in room ${conversationId} from sender ${sender} broadcasted.`);
    } catch (err) {
      console.error('Socket message save/broadcast error:', err.message);
      socket.emit('errorMessage', 'Failed to send message.');
    }
  });

  // 2. Typing Indicators
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typingStatus', { userId, isTyping: true });
  });

  socket.on('stopTyping', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typingStatus', { userId, isTyping: false });
  });

  // 3. Read Receipts
  socket.on('markAsRead', async ({ conversationId, userId }) => {
    try {
      // Mark all unread messages received by this user in this conversation as read
      await ChatMessage.updateMany(
        { conversationId, receiver: userId, read: false },
        { $set: { read: true } }
      );
      
      // Emit event to notify the sender that their messages have been read
      socket.to(conversationId).emit('messagesRead', { conversationId, readerId: userId });
      console.log(`Messages in conversation ${conversationId} marked as read by ${userId}`);
    } catch (error) {
      console.error('Failed to mark messages as read:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const userSockets = onlineUsers.get(socket.userId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(socket.userId);
      }
      
      // Broadcast updated online users list
      io.emit('onlineUsersList', Array.from(onlineUsers.keys()));
      console.log(`User ${socket.userId} disconnected. Total online: ${onlineUsers.size}`);
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
