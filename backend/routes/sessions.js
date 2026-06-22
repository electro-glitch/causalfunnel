const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/sessions — group by session_id
router.get('/', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          last_seen: { $max: '$timestamp' },
        },
      },
      { $sort: { last_seen: -1 } },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          event_count: 1,
          last_seen: 1,
        },
      },
    ]);
    res.json(sessions);
  } catch (err) {
    console.error('GET /api/sessions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:id — all events for a session ordered by timestamp
router.get('/:id', async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.id })
      .sort({ timestamp: 1 })
      .lean();
    res.json(events);
  } catch (err) {
    console.error('GET /api/sessions/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
