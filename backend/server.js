const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const initSockets = require('./sockets/socketEvents');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4200';
const allowedOrigins = CLIENT_URL.split(',').map((s) => s.trim());

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);

app.get('/', (req, res) => res.json({ message: 'ConnectHub API is running', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meeting'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/files', require('./routes/file'));

app.use(notFound);
app.use(errorHandler);

initSockets(io);
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('ConnectHub API + Socket.io listening on port ' + PORT));

process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
