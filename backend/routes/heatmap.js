const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/heatmap?url= — return click events for a specific URL
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }

    const clicks = await Event.find({ type: 'click', url })
      .sort({ timestamp: -1 })
      .lean();

    res.json(clicks);
  } catch (err) {
    console.error('GET /api/heatmap error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
