# 📊 User Analytics

A full-stack user analytics platform that tracks page views and clicks, aggregates session data, and visualizes click heatmaps — all in real time.

## Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Backend  | Node.js + Express           |
| Database | MongoDB (Mongoose) on Atlas |
| Frontend | React (Vite)                |
| Tracker  | Vanilla JavaScript          |

## Folder Structure

```
/backend   — Express API server
/frontend  — React dashboard (Vite)
/tracker   — tracker.js (drop-in script)
/demo      — demo HTML page with tracker
```

---

## Setup (Local)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI to your MongoDB Atlas connection string
npm install
npm run dev
```

The backend runs on `http://localhost:3001` by default.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env — set VITE_BACKEND_URL (default: http://localhost:3001)
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

### 3. Demo Page

Open `demo/index.html` in a browser. It loads `tracker.js` and sends events to the backend. Make sure the backend is running first.

> **Tip:** If you need to change the backend URL, edit `window.TRACKER_URL` in `demo/index.html`.

---

## Setup (Hosted)

1. **Deploy the backend** to any Node.js host (Render, Railway, Fly.io, etc.). Set `MONGODB_URI` and `PORT` as environment variables.
2. **Deploy the frontend** to any static host (Vercel, Netlify, etc.). Set `VITE_BACKEND_URL` to your deployed backend URL.
3. **Embed the tracker** on any page:
   ```html
   <script>
     window.TRACKER_URL = 'https://your-backend-url.com';
   </script>
   <script src="https://your-cdn.com/tracker.js"></script>
   ```

---

## API Endpoints

| Method | Route                | Description                             |
| ------ | -------------------- | --------------------------------------- |
| POST   | `/api/events`        | Store event(s) — accepts single or array |
| GET    | `/api/sessions`      | List sessions with event count & last seen |
| GET    | `/api/sessions/:id`  | All events for a session (ordered by time) |
| GET    | `/api/heatmap?url=`  | Click events for a specific URL         |
| GET    | `/api/health`        | Health check (`{ status: "ok" }`)       |

---

## Design Decisions

### Percentage-Based Coordinates

Click positions are stored as ratios (0–1) of `clientX/innerWidth` and `clientY/innerHeight`. This makes heatmap data resolution-independent — clicks render correctly regardless of the dashboard viewport size or the original user's screen resolution.

### Event Batching

The tracker batches events and flushes them to the backend either:
- Every **5 events**, or
- Every **3 seconds** (whichever comes first)

This reduces network requests while keeping data delivery reasonably low-latency. On page unload, `sendBeacon` ensures remaining events are delivered reliably.

### MongoDB Indexing

The `Event` collection has indexes on:
- `session_id` — fast lookups for session-based queries
- `timestamp` — efficient time-range filtering
- Compound `{ session_id, timestamp }` — optimal for the `/api/sessions/:id` endpoint which sorts events within a session by time

These indexes keep query performance consistent as the dataset grows.
