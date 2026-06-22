import { useState, useEffect, useCallback } from 'react';
import { fetchSessions, fetchSessionEvents } from '../api';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function truncateId(id) {
  if (!id) return '';
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export default function SessionsView() {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + 10s polling
  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  // Load events when a session is selected
  useEffect(() => {
    if (!selectedId) {
      setEvents([]);
      return;
    }

    let cancelled = false;
    setEventsLoading(true);

    fetchSessionEvents(selectedId)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleRowClick = (sessionId) => {
    setSelectedId(selectedId === sessionId ? null : sessionId);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Sessions</h1>
        <p className="page-subtitle">
          <span className="status-dot live"></span>
          {sessions.length} active session{sessions.length !== 1 ? 's' : ''} · Auto-refreshing every 10s
        </p>
        <p className="page-subtitle" style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          ℹ️ Sessions inactive for over 1 hour are automatically hidden. 
          When a session becomes active again, it will reappear with all its historical activity.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Sessions</span>
          <span className="badge badge-purple">{sessions.length}</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            Loading sessions…
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No sessions yet</p>
            <p style={{ fontSize: '0.8rem' }}>
              Open the demo page and click around to start generating events.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Last URL</th>
                <th>Events</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.session_id}
                  className={selectedId === s.session_id ? 'active' : ''}
                  onClick={() => handleRowClick(s.session_id)}
                >
                  <td>
                    <span className="session-id" title={s.session_id}>
                      {truncateId(s.session_id)}
                    </span>
                  </td>
                  <td>
                    <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }} title={s.last_url}>
                      {s.last_url}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{s.event_count}</span>
                  </td>
                  <td>{formatTime(s.last_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedId && (
        <div className="session-detail">
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                Events for{' '}
                <span className="session-id">{truncateId(selectedId)}</span>
              </span>
              <span className="badge badge-teal">{events.length} events</span>
            </div>

            <div className="card-body">
              {eventsLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Loading events…
                </div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <p>No events found for this session.</p>
                </div>
              ) : (
                <div className="event-list">
                  {events.map((e, i) => (
                    <div className="event-item" key={e._id || i}>
                      <div className={`event-type-icon ${e.type}`}>
                        {e.type === 'page_view' ? '👁' : '🖱'}
                      </div>
                      <div className="event-info">
                        <div className="event-type-label">{e.type}</div>
                        <div className="event-url" title={e.url}>
                          {e.url}
                        </div>
                      </div>
                      {e.type === 'click' && e.x != null && (
                        <span className="event-coords">
                          ({(e.x * 100).toFixed(1)}%, {(e.y * 100).toFixed(1)}%)
                        </span>
                      )}
                      <span className="event-timestamp">
                        {formatTime(e.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
