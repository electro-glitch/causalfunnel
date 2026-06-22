import { useState, useEffect, useMemo } from 'react';
import { fetchSessions, fetchHeatmap } from '../api';

export default function HeatmapView() {
  const [sessions, setSessions] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch sessions to extract unique URLs
  useEffect(() => {
    fetchSessions()
      .then((data) => setSessions(data))
      .catch((err) => console.error('Failed to fetch sessions:', err));
  }, []);

  // Extract unique URLs from session events (we'll get them from heatmap data)
  // For URL dropdown, we aggregate from all sessions by fetching them
  const [allUrls, setAllUrls] = useState([]);

  useEffect(() => {
    // Fetch all sessions then their events to get unique URLs
    const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    fetch(`${API}/api/sessions`)
      .then((r) => r.json())
      .then(async (sessionList) => {
        const urlSet = new Set();
        // Fetch events from a few sessions to get URLs
        const toFetch = sessionList.slice(0, 20);
        await Promise.all(
          toFetch.map((s) =>
            fetch(`${API}/api/sessions/${s.session_id}`)
              .then((r) => r.json())
              .then((events) => events.forEach((e) => urlSet.add(e.url)))
              .catch(() => {})
          )
        );
        const urls = Array.from(urlSet).sort();
        setAllUrls(urls);
        if (urls.length > 0 && !selectedUrl) {
          setSelectedUrl(urls[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch heatmap data when URL is selected (and poll every 2s)
  useEffect(() => {
    if (!selectedUrl) {
      setClicks([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const loadHeatmap = () => {
      fetchHeatmap(selectedUrl)
        .then((data) => {
          if (!cancelled) {
            setClicks(data);
            setLoading(false);
          }
        })
        .catch((err) => console.error('Failed to fetch heatmap:', err));
    };

    loadHeatmap();
    const interval = setInterval(loadHeatmap, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedUrl]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Heatmap</h1>
        <p className="page-subtitle">
          Visualize click density across your pages · <span className="status-dot live"></span> Auto-refreshing every 2s
        </p>
      </div>

      <div className="heatmap-controls">
        <div className="select-wrapper">
          <select
            className="select-input"
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
          >
            <option value="" disabled>
              Select a URL…
            </option>
            {allUrls.map((url) => (
              <option key={url} value={url}>
                {url}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Click Positions</span>
          {clicks.length > 0 && (
            <span className="badge badge-purple">{clicks.length} clicks</span>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="heatmap-canvas">
            <div className="heatmap-canvas-grid"></div>
            {loading ? (
              <div className="loading-spinner" style={{ height: '100%' }}>
                <div className="spinner"></div>
                Loading click data…
              </div>
            ) : clicks.length === 0 ? (
              <div className="heatmap-empty">
                {selectedUrl
                  ? 'No click data for this URL yet.'
                  : 'Select a URL to view the heatmap.'}
              </div>
            ) : (
              clicks.map((c, i) => (
                <div
                  key={c._id || i}
                  className="heatmap-dot"
                  style={{
                    left: `${(c.x ?? 0) * 100}%`,
                    top: `${(c.y ?? 0) * 100}%`,
                    animationDelay: `${i * 0.02}s`,
                  }}
                  title={`(${((c.x ?? 0) * 100).toFixed(1)}%, ${((c.y ?? 0) * 100).toFixed(1)}%)`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {clicks.length > 0 && (
        <div className="heatmap-stats">
          <div className="stat-chip">
            🖱 Total clicks: <strong>{clicks.length}</strong>
          </div>
          <div className="stat-chip">
            📍 Avg X:{' '}
            <strong>
              {(
                (clicks.reduce((s, c) => s + (c.x ?? 0), 0) / clicks.length) *
                100
              ).toFixed(1)}
              %
            </strong>
          </div>
          <div className="stat-chip">
            📍 Avg Y:{' '}
            <strong>
              {(
                (clicks.reduce((s, c) => s + (c.y ?? 0), 0) / clicks.length) *
                100
              ).toFixed(1)}
              %
            </strong>
          </div>
        </div>
      )}
    </>
  );
}
