const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'userAvatar'));
  },
  // 圖片名稱
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploader = multer({
  storage: storage,
  // 過濾圖片的種類
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png') {
      cb(new Error('上傳的檔案型態不接受'), false);
    } else {
      cb(null, true);
    }
  },
  // 過濾檔案的大小
  limits: {
    // 1k = 1024 => 200k = 200 * 1024
    fileSize: 200 * 1024,
  },
});

router.put('/', uploader.single('photo'), async (req, res) => {
  let filename = req.file ? '/userAvatar/' + req.file.filename : '';
  await pool.execute('UPDATE users SET name = ? , birth = ? ,phone = ? ,gender=?, city = ? , area= ? ,intro = ? ,photo=? WHERE id=?', [
    req.body.name,
    req.body.birth,
    req.body.phone,
    req.body.gender,
    req.body.cityName,
    req.body.areaName,
    req.body.intro,
    filename,
    req.session.user.id,
  ]);

  //傳回更新資料
  let [users] = await pool.execute('SELECT * FROM users WHERE id= ?', [req.session.user.id]);
  let user = users[0];
  res.json(user);
});
module.exports = router;
