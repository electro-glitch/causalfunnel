(function () {
  'use strict';

  const BATCH_SIZE = 1;
  const FLUSH_INTERVAL_MS = 500;

  let queue = [];
  let flushTimer = null;

  // Session ID: persist in localStorage, generate with crypto.randomUUID
  function getSessionId() {
    const KEY = '__analytics_session_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  const sessionId = getSessionId();

  function getTrackerUrl() {
    return (window.TRACKER_URL || 'http://localhost:3001').replace(/\/+$/, '');
  }

  function enqueue(event) {
    queue.push(event);

    if (queue.length >= BATCH_SIZE) {
      flush();
    } else if (!flushTimer) {
      flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
    }
  }

  function flush(useBeacon) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }

    if (queue.length === 0) return;

    const batch = queue.slice();
    queue = [];

    const url = getTrackerUrl() + '/api/events';
    const payload = JSON.stringify(batch);

    // Use sendBeacon only during page unload; fetch for normal flushes
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch((err) => console.warn('[Tracker] flush error:', err));
    }
  }

  // Fire page_view immediately
  enqueue({
    session_id: sessionId,
    type: 'page_view',
    url: window.location.href,
    timestamp: Date.now(),
    x: null,
    y: null,
  });

  // Capture clicks with percentage-based coordinates
  document.addEventListener('click', function (e) {
    enqueue({
      session_id: sessionId,
      type: 'click',
      url: window.location.href,
      timestamp: Date.now(),
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  });

  // Flush remaining events on page unload
  window.addEventListener('beforeunload', () => flush(true));
})();
