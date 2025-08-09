const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const Url = require('../models/Url');

router.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = `http://localhost:${process.env.PORT || 5000}`;

  if (!longUrl) {
    return res.status(400).json('URL is required');
  }

  try {
    let url = await Url.findOne({ longUrl });

    if (url) {
      res.json(url);
    } else {
      const shortCode = shortid.generate();
      const shortUrl = `${baseUrl}/${shortCode}`;

      url = new Url({
        longUrl,
        shortCode,
        clickCount: 0,
      });

      await url.save();
      res.json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

router.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (url) {
      url.clickCount++;
      await url.save();
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

router.get('/api/admin/urls', async (req, res) => {
    try {
        const urls = await Url.find().sort({ date: -1 });
        res.json(urls);
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

module.exports = router;