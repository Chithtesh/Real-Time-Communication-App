const mongoose = require('mongoose');

const dbState = { connected: false };

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not set. Copy backend/.env.example to backend/.env and configure it.');
    return;
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    dbState.connected = true;
    console.log('[DB] MongoDB connected: ' + mongoose.connection.host + '/' + mongoose.connection.name);
  } catch (err) {
    dbState.connected = false;
    console.error('[DB] MongoDB connection failed:', err.message);
    console.error('[DB] The API server keeps running, but database-backed features return 503 until MongoDB is reachable.');
    console.error('[DB] Start MongoDB locally (mongod) or set MONGODB_URI to a MongoDB Atlas connection string in backend/.env');
  }
  mongoose.connection.on('connected', () => { dbState.connected = true; });
  mongoose.connection.on('disconnected', () => { dbState.connected = false; console.warn('[DB] MongoDB disconnected'); });
  mongoose.connection.on('reconnected', () => { dbState.connected = true; console.log('[DB] MongoDB reconnected'); });
  mongoose.connection.on('error', (e) => console.error('[DB] MongoDB error:', e.message));
}

module.exports = { connectDB, dbState };
