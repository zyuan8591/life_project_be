const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const path = require('path');
const multer = require('multer');
const argon2 = require('argon2');
const { body, validationResult } = require('express-validator');

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
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp') {
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

//密碼修改
const reqistetRules = [
  body('password').isLength({ min: 8 }).withMessage('請輸入8個字以上的半形英文數字'),
  body('newPassword').isLength({ min: 8 }).withMessage('請輸入8個字以上的半形英文數字'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage('「密碼」不一致'),
];
router.put('/password', reqistetRules, async (req, res) => {
  const validateResult = validationResult(req);
  if (!validateResult.isEmpty()) {
    return res.status(400).json({ errors: validateResult.array() });
  }
  let [users] = await pool.execute('SELECT * FROM users WHERE id= ?', [req.session.user.id]);
  let user = users[0];
  //驗證舊密碼有無相符合
  let verifyResult = await argon2.verify(user.password, req.body.password);
  if (!verifyResult) {
    return res.status(401).json({ message: '舊密碼錯誤' });
  }
  let hashPassword = await argon2.hash(req.body.newPassword, 10);

  await pool.execute('UPDATE users SET password=? WHERE id=?', [hashPassword, req.session.user.id]);
  res.json('密碼修改成功');
});

router.put('/forgotpassword', reqistetRules, async (req, res) => {
  let hashPassword = await argon2.hash(req.body.newPassword, 10);
  await pool.execute('UPDATE users SET password=? WHERE id=?', [hashPassword, req.session.member.id]);
  res.json('密碼修改成功');
});

module.exports = router;
