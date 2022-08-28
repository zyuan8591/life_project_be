const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
// ===========================================================================
// get news data
router.get('/', async function (req, res) {
  let [data] = await pool.query(`SELECT news.*, news_category.name AS categoryName FROM news JOIN news_category ON news.category = news_category.id `);
  res.json(data);
});

module.exports = router;
