# ConnectHub — Real-Time Communication & Collaboration App

**CodeAlpha Full Stack Development Internship — Task 4**

ConnectHub is a working, full-stack video conferencing and collaboration platform. Authenticated users create or join meeting rooms and communicate in real time with multi-user video/audio calling, screen sharing, live chat, file sharing and a collaborative whiteboard.

> This is a **real** application, not a UI mockup. Video/audio uses **WebRTC**, signaling and real-time events use **Socket.io**, persistent data uses **MongoDB/Mongoose**, the API is **Node.js/Express**, the UI is **Angular**, and authentication uses **JWT + bcrypt**.

---

## 1. Features

- **Authentication** — register, login, logout, profile; bcrypt password hashing; JWT sessions; route guards.
- **Meeting rooms** — create a room with a unique ID (e.g. `CONNECT-XAG6N`), copy the ID/link, join by ID, meeting history.
- **Multi-user video & audio** — WebRTC mesh with Socket.io signaling (offer/answer/ICE), responsive video grid, per-participant mic/camera status.
- **Media controls** — mute/unmute, camera on/off, leave meeting (full peer cleanup).
- **Screen sharing** — `getDisplayMedia()`; replaces the outgoing camera track and restores it on stop; notifies peers.
- **Real-time chat** — instant messaging, sender name + timestamp, auto-scroll, history persisted to MongoDB.
- **File sharing** — Multer uploads with type/size validation, upload progress, download, per-meeting file list.
- **Collaborative whiteboard** — HTML5 Canvas; pen/eraser/color/size/clear/save; synchronized via coordinate events (not image snapshots).
- **Participants panel** — live list, join/leave toasts, participant count.
- **Security** — Helmet, CORS allow-list, rate limiting, input validation, JWT middleware, protected Socket.io handshake.
- **Responsive UI** — Bootstrap 5 + CSS Grid/Flexbox; works on desktop, tablet and mobile.

## 2. Technology Stack

| Layer | Tech |
|---|---|
| Frontend | Angular 17 (standalone components), TypeScript, RxJS, Reactive Forms, Router, Bootstrap 5 |
| Real-time | WebRTC, Socket.io |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Files | Multer |
| Security | Helmet, CORS, express-rate-limit, express-validator, dotenv |

## 3. Architecture

```
Browser (Angular)
   AuthService HTTP Express REST API  MongoDB (users, meetings, messages, files)
   SocketService WS Socket.io server (signaling, chat, whiteboard, presence)
   WebRTCService P2P Other browsers (encrypted DTLS-SRTP media)
```
- Socket.io is the **signaling** channel (SDP offers/answers + ICE candidates) and the **real-time** channel (chat, whiteboard, presence, screen-share events).
- Media flows **peer-to-peer** over WebRTC. In a mesh, each participant opens one `RTCPeerConnection` per remote peer.

## 4. Folder Structure

```
backend/
  config/db.js            models/{User,Meeting,Message,File}.js
  controllers/            routes/{auth,meeting,message,file}.js
  middleware/{auth,error}.js
  sockets/socketEvents.js server.js  .env  uploads/
frontend/src/app/
  components/{navbar,video-grid,video-card,meeting-controls,chat,file-sharing,whiteboard,participants}
  pages/{home,login,register,dashboard,create-meeting,join-meeting,meeting-room}
  services/{auth,socket,webrtc,meeting,chat,file,whiteboard,toast}.service.ts
  guards/auth.guard.ts  interceptors/auth.interceptor.ts  models/  app.routes.ts  app.config.ts
```

## 5. Requirements

- Node.js 18+ (global `fetch`/modern tooling), npm
- MongoDB (local `mongod`) **or** a MongoDB Atlas connection string
- A modern browser (Chrome/Edge/Firefox). Camera + microphone permissions required.

## 6. MongoDB Setup

**Local:** install MongoDB Community, then run `mongod` (default `mongodb://127.0.0.1:27017`).
**Atlas:** create a free cluster, add a database user + IP allow-list, copy the connection string.

## 7. Environment Variables

Create `backend/.env` (a template is provided in `backend/.env.example`):

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/connecthub
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
MAX_FILE_SIZE_MB=25
```
Never commit real secrets. The frontend API/Socket URLs live in `frontend/src/environments/environment.ts`.

## 8. Backend Setup

```bash
cd backend
npm install
npm start        # http://localhost:5000  (GET /api/health to verify)
```

## 9. Frontend Setup

```bash
cd frontend
npm install
npm start        # http://localhost:4200
```

## 10-15. How to Use

1. **Register** a user, then **Login**  you land on the Dashboard.
2. **Create Meeting**  copy the Meeting ID or link  **Start Meeting**.
3. Open a second browser/incognito window, **register/login as a different user**, **Join Meeting** with the same ID.
4. **Video/Audio:** both local and remote videos appear; toggle mic/camera; watch participant toasts.
5. **Screen share:** click the screen icon, pick a screen/window/tab; peers see it; stop to return to camera.
6. **Chat:** open the Chat panel and send — messages appear instantly and persist.
7. **Files:** open Files, upload a PDF/DOC/TXT/image/ZIP (25MB); peers see it and can download.
8. **Whiteboard:** open Board and draw — strokes sync live; try eraser and clear.

## 16. API Documentation

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Login, returns JWT |
| GET | `/api/auth/profile` | JWT | Current user |
| POST | `/api/meetings` | JWT | Create meeting |
| GET | `/api/meetings` | JWT | List meetings |
| GET | `/api/meetings/:meetingId` | JWT | Get meeting |
| POST | `/api/meetings/:meetingId/join` | JWT | Join meeting |
| POST | `/api/meetings/:meetingId/leave` | JWT | Leave meeting |
| GET | `/api/messages/:meetingId` | JWT | Chat history |
| POST | `/api/files/upload` | JWT | Upload file (multipart) |
| GET | `/api/files/:id` | JWT | Download file |
| GET | `/api/files/meeting/:meetingId` | JWT | List meeting files |

Responses are consistent JSON: `{ success, ...data }` or `{ success:false, message }`. Status codes: 400, 401, 403, 404, 413, 500.

## 17. Socket.io Events

`connection`, `disconnect`, `join-room`, `leave-room`, `user-joined`, `user-left`, `offer`, `answer`, `ice-candidate`, `send-message`, `receive-message`, `draw`, `clear-board`, `screen-share-started`, `screen-share-stopped`, `participant-updated`, `participants-updated`, `room-participants`. The handshake requires a valid JWT (`auth.token`).

## 18. WebRTC Explanation

`getUserMedia()` captures local media. For each remote peer an `RTCPeerConnection` is created with a STUN server (`stun:stun.l.google.com:19302`). The joining peer sends an SDP **offer**; the receiver sets it as remote, replies with an **answer**; both exchange **ICE candidates**. `ontrack` attaches the remote `MediaStream` to a `<video>`. Screen sharing uses `replaceTrack()` on the video sender and restores the camera track on stop. All connections and tracks are closed on leave/unmount.

## 19. Security Details (accurate)

- Passwords hashed with **bcrypt**; password field never returned.
- **JWT** protects REST endpoints and the Socket.io handshake.
- **Helmet** sets secure HTTP headers; **CORS** is restricted to `CLIENT_URL`; **rate limiting** on `/api`.
- File uploads validated by extension/MIME and size; executables rejected; served with `Content-Disposition: attachment`.
- **Media transport is encrypted by WebRTC (DTLS-SRTP).** This app does **not** implement custom end-to-end encryption; signaling is authenticated but the server can see signaling metadata. Do not claim E2EE.

## 20. Testing Two Users

Use two browser profiles (e.g. normal + incognito) or two machines on the same network. For remote networks beyond NAT, configure a **TURN** server in `environment.ts` `iceServers` (STUN alone often fails across symmetric NAT).

## 21. Common Errors & Fixes

- **`MONGODB_URI is not set` / DB 503**  set `MONGODB_URI` in `backend/.env` and ensure `mongod`/Atlas is reachable.
- **CORS blocked**  set `CLIENT_URL` to the exact frontend origin.
- **Camera blocked**  use `http://localhost` (secure context) or HTTPS; grant permissions.
- **No remote video across networks**  add a TURN server to `iceServers`.
- **`ng` not found**  run `npm install` in `frontend`, or use `npx ng`.
- **Port 5000 in use**  change `PORT` in `.env` and the URLs in `environment.ts`.

## 22. Future Enhancements

TURN/STUN config via env, recording, adaptive bitrate, role-based rooms, e2ee, mobile apps, Redis presence for horizontal scaling.

## 23. Internship Presentation Summary

ConnectHub demonstrates a production-style real-time architecture: an Angular SPA secured by JWT, an Express/MongoDB backend for persistence, Socket.io for low-latency signaling and collaboration, and WebRTC for encrypted peer-to-peer media. It covers authentication, authorization, real-time messaging, media streaming, file handling, canvas collaboration, security hardening and responsive design — the core competencies of full-stack development.
#   R e a l - T i m e - C o m m u n i c a t i o n - A p p  
 