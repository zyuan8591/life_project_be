const express = require('express');
const router = express.Router();

const newsController = require('../controllers/news');

// ===========================================================================
// GET NEWS: /api/1.0/news
router.get('/', newsController.getNewsList);

module.exports = router;
