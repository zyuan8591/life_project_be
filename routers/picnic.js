const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/official', async (req, res) => {
  let [data] = await pool.execute('SELECT * FROM activity_pincnic_official');
//   console.log(data);
  res.json(data);
});
module.exports = router;
