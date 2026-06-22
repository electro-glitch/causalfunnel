const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /api/events — store event(s)
router.post('/', async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    const docs = events.map((e) => ({
      session_id: e.session_id,
      type: e.type,
      url: e.url,
      timestamp: e.timestamp,
      x: e.x ?? null,
      y: e.y ?? null,
    }));

    await Event.insertMany(docs);
    res.status(201).json({ inserted: docs.length });
  } catch (err) {
    console.error('POST /api/events error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
