const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/', async (req, res, next) => {
  //撈資料庫，把資料給前端
  if (!req.session.user) {
    //尚未登入
    return res.status(403).json({ msg: '尚未登入' });
  }
  let [users] = await pool.execute('SELECT * FROM users WHERE id= ?', [req.session.user.id]);
  let user = users[0];
  res.json(user);
});
module.exports = router;
