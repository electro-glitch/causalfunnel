const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function fetchSessions() {
  const res = await fetch(`${API}/api/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function fetchSessionEvents(sessionId) {
  const res = await fetch(`${API}/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session events');
  return res.json();
}

export async function fetchHeatmap(url) {
  const res = await fetch(`${API}/api/heatmap?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch heatmap data');
  return res.json();
}
