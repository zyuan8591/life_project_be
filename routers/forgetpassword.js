const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.post('/', async (req, res) => {
  let [users] = await pool.execute('SELECT * FROM users WHERE email= ?', [req.body.email]);
  //確認資料庫有無此信箱
  if (users.length == 0) {
    return res.status(401).json({ message: '信箱或密碼錯誤' });
  }

  let user = users[0];

  //把資料拿給前端
  let saveUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  req.session.member = saveUser;

  res.json(saveUser);
});

// // logout
// router.get('/logout', async (req, res) => {
//   req.session.user = null;
//   res.json({ message: ' 登出成功' });
// });
module.exports = router;
