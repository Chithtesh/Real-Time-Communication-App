const { verifySocketToken } = require('../middleware/auth');
const Message = require('../models/Message');
const Meeting = require('../models/Meeting');
const { dbState } = require('../config/db');

// meetingId -> Map(socketId -> participant)
const rooms = new Map();

function getRoom(id) {
  if (!rooms.has(id)) rooms.set(id, new Map());
  return rooms.get(id);
}

function broadcastParticipants(io, meetingId, room) {
  const list = [...room.values()];
  io.to(meetingId).emit('participants-updated', { meetingId, participants: list, count: list.length });
}

module.exports = function initSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const user = await verifySocketToken(token);
      socket.user = { id: user._id.toString(), name: user.name, email: user.email };
      next();
    } catch (e) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const me = socket.user;

    socket.on('join-room', ({ meetingId }) => {
      if (!meetingId) return;
      meetingId = String(meetingId).toUpperCase();
      socket.join(meetingId);
      socket.data.meetingId = meetingId;

      const room = getRoom(meetingId);
      room.set(socket.id, { socketId: socket.id, userId: me.id, name: me.name, muted: false, cameraOff: false, sharing: false });

      const others = [...room.values()].filter((p) => p.socketId !== socket.id);
      socket.emit('room-participants', { meetingId, participants: others });
      socket.to(meetingId).emit('user-joined', { socketId: socket.id, userId: me.id, name: me.name });
      broadcastParticipants(io, meetingId, room);

      if (dbState.connected) {
        Meeting.findOne({ meetingId }).then((m) => {
          if (!m) return;
          const ex = m.participants.some((p) => p.user && p.user.toString() === me.id && !p.leftAt);
          if (!ex) m.participants.push({ user: me.id, name: me.name });
          if (!m.startTime) m.startTime = new Date();
          m.status = 'active';
          m.save().catch(() => {});
        }).catch(() => {});
      }
    });

    function handleLeave() {
      const meetingId = socket.data.meetingId;
      if (!meetingId) return;
      const room = rooms.get(meetingId);
      if (room) {
        room.delete(socket.id);
        socket.to(meetingId).emit('user-left', { socketId: socket.id, userId: me.id, name: me.name });
        broadcastParticipants(io, meetingId, room);
        if (room.size === 0) {
          rooms.delete(meetingId);
          if (dbState.connected) Meeting.updateOne({ meetingId }, { $set: { status: 'ended', endTime: new Date() } }).catch(() => {});
        }
      }
      socket.data.meetingId = null;
    }

    socket.on('leave-room', handleLeave);

    socket.on('offer', ({ to, offer }) => { if (to) io.to(to).emit('offer', { from: socket.id, offer }); });
    socket.on('answer', ({ to, answer }) => { if (to) io.to(to).emit('answer', { from: socket.id, answer }); });
    socket.on('ice-candidate', ({ to, candidate }) => { if (to) io.to(to).emit('ice-candidate', { from: socket.id, candidate }); });

    socket.on('send-message', async ({ meetingId, message }) => {
      if (!meetingId || !message || !String(message).trim()) return;
      meetingId = String(meetingId).toUpperCase();
      const text = String(message).trim().slice(0, 4000);
      const payload = { meetingId, sender: me.id, senderName: me.name, message: text, timestamp: new Date() };
      io.to(meetingId).emit('receive-message', payload);
      if (dbState.connected) {
        try { await Message.create({ meetingId, sender: me.id, senderName: me.name, message: text }); } catch (e) {}
      }
    });

    socket.on('draw', (data) => { const m = socket.data.meetingId; if (m) socket.to(m).emit('draw', Object.assign({}, data, { from: socket.id })); });
    socket.on('erase', (data) => { const m = socket.data.meetingId; if (m) socket.to(m).emit('erase', Object.assign({}, data, { from: socket.id })); });
    socket.on('clear-board', () => { const m = socket.data.meetingId; if (m) socket.to(m).emit('clear-board', { from: socket.id }); });

    socket.on('screen-share-started', () => {
      const m = socket.data.meetingId; if (!m) return;
      const r = rooms.get(m); if (r && r.get(socket.id)) r.get(socket.id).sharing = true;
      socket.to(m).emit('screen-share-started', { socketId: socket.id, name: me.name });
      if (r) broadcastParticipants(io, m, r);
    });
    socket.on('screen-share-stopped', () => {
      const m = socket.data.meetingId; if (!m) return;
      const r = rooms.get(m); if (r && r.get(socket.id)) r.get(socket.id).sharing = false;
      socket.to(m).emit('screen-share-stopped', { socketId: socket.id, name: me.name });
      if (r) broadcastParticipants(io, m, r);
    });

    socket.on('participant-updated', (status) => {
      const m = socket.data.meetingId; if (!m) return;
      const r = rooms.get(m); if (!r) return;
      const p = r.get(socket.id); if (!p) return;
      if (typeof status.muted === 'boolean') p.muted = status.muted;
      if (typeof status.cameraOff === 'boolean') p.cameraOff = status.cameraOff;
      socket.to(m).emit('participant-updated', { socketId: socket.id, userId: me.id, name: me.name, muted: p.muted, cameraOff: p.cameraOff });
    });

    socket.on('disconnect', handleLeave);
  });
};
