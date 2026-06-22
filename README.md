# 📊 User Analytics — CausalFunnel

A full-stack user analytics platform that tracks page views and clicks across any website, aggregates session data, and visualizes click heatmaps in a real-time dashboard.

> **Live Demo**
> - 🖥 Dashboard: *[Your Vercel URL]*
> - ⚙️ Backend API: [https://causalfunnel-1.onrender.com](https://causalfunnel-1.onrender.com)

---

## Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Backend  | Node.js + Express           |
| Database | MongoDB (Mongoose) on Atlas |
| Frontend | React (Vite)                |
| Tracker  | Vanilla JavaScript          |
| Hosting  | Render (API) + Vercel (UI)  |

---

## How It Works

```
┌─────────────┐       POST /api/events       ┌─────────────┐       MongoDB
│  Any Website│  ──────────────────────────►  │   Express    │  ──►  Atlas
│  + tracker  │   (batched every 5 events     │   Backend    │
│             │    or every 3 seconds)        │              │
└─────────────┘                               └──────┬───────┘
                                                     │
                                              GET /api/sessions
                                              GET /api/heatmap
                                                     │
                                              ┌──────▼───────┐
                                              │    React      │
                                              │   Dashboard   │
                                              └───────────────┘
```

---

## Adding the Tracker to Any Website

Drop these two lines before `</body>` on any webpage:

```html
<script>
  window.TRACKER_URL = 'https://causalfunnel-1.onrender.com';
</script>
<script src="https://causalfunnel-1.onrender.com/tracker.js"></script>
```

That's it. The tracker will automatically:
- Generate a unique session ID (stored in `localStorage`)
- Track a `page_view` event on page load
- Track every `click` with x/y coordinates
- Batch events and send them to the backend

No configuration, no build step, no dependencies.

---

## Project Structure

```
/backend     Express API server
/frontend    React dashboard (Vite)
/tracker     tracker.js (drop-in tracking script)
/demo        Demo HTML page with tracker pre-configured
```

---

## API Endpoints

| Method | Route                | Description                                     |
| ------ | -------------------- | ----------------------------------------------- |
| GET    | `/`                  | API overview and available endpoints             |
| GET    | `/api/health`        | Health check → `{ status: "ok" }`               |
| POST   | `/api/events`        | Store event(s) — accepts single object or array  |
| GET    | `/api/sessions`      | List sessions with event count and last seen     |
| GET    | `/api/sessions/:id`  | All events for a session, ordered by timestamp   |
| GET    | `/api/heatmap?url=`  | Click events for a specific URL (for heatmap)    |
| GET    | `/tracker.js`        | Serve the tracking script                        |

### Event Schema

```json
{
  "session_id": "uuid-string",
  "type": "page_view | click",
  "url": "https://example.com/page",
  "timestamp": 1750567000000,
  "x": 0.45,
  "y": 0.32
}
```

- `x` and `y` are `null` for `page_view` events
- For `click` events, they are ratios (0–1) of viewport dimensions

---

## Dashboard Features

### Sessions View
- Lists all tracked sessions with total event count and last activity time
- Click any session to expand its full event timeline (user journey)
- Auto-refreshes every 10 seconds

### Heatmap View
- Dropdown to select a tracked page URL
- Renders click positions as dots on an 800×500 canvas
- Shows aggregate stats (total clicks, average position)

---

## Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI to your Atlas connection string
npm install
npm run dev      # Runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env — set VITE_BACKEND_URL (e.g. http://localhost:3001)
npm install
npm run dev      # Runs on http://localhost:5173
```

### Demo Page

Open `demo/index.html` in a browser. It comes pre-configured with the tracker. Click around to generate events, then check the dashboard.

---

## Hosted Deployment

### Backend (Render)

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`, **Start Command** to `npm start`
5. Add environment variable: `MONGODB_URI`
6. In MongoDB Atlas → Network Access → allow `0.0.0.0/0`

### Frontend (Vercel)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`, **Framework** to Vite
3. Add environment variable: `VITE_BACKEND_URL` = your Render URL

---

## Design Decisions & Trade-offs

### Percentage-Based Click Coordinates
Click positions are stored as ratios (0–1) of `clientX / innerWidth` and `clientY / innerHeight`. This makes heatmap data **resolution-independent** — clicks render correctly regardless of the viewer's screen size or the original user's viewport.

### Event Batching
The tracker batches events and flushes either every **5 events** or every **3 seconds** (whichever comes first). This reduces network overhead while keeping data delivery low-latency. On page unload, `navigator.sendBeacon` ensures remaining events aren't lost.

### MongoDB Indexing
The `Event` collection has indexes on:
- `session_id` — fast session-based lookups
- `timestamp` — efficient time-range filtering
- Compound `{ session_id, timestamp }` — optimal for the ordered event timeline query

### Stateless Tracker
The tracker script is fully self-contained with zero dependencies. It generates its own session ID using `crypto.randomUUID()` and persists it in `localStorage`. No cookies, no external libraries, no build step required.

### CORS
CORS is enabled for all origins so the tracker can be embedded on any domain. For production use, this should be restricted to known domains.

---

## Assumptions

- Each browser tab/device gets a unique session (based on `localStorage`)
- Session IDs persist across page reloads but not across different browsers/devices
- The heatmap uses viewport-relative coordinates, not document-relative
- MongoDB Atlas free tier is sufficient for demo workloads
- Render free tier may have cold starts (~30s) after 15 min of inactivity
