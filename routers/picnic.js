const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const picnicController = require('../controllers/picnic');
const authMid = require('../middlewares/auth');
const picnicModel = require('../models/picnic');

// --------- 官方活動 ---------
// 首頁列表
router.get('/official', picnicController.getPicnicList);

// get includes
router.get('/official/officialAllJoin', authMid.checkLogin, async (req, res) => {
  let getJoin = await picnicModel.getJoinOfficial(req.session.user.id);
  // console.log(req.session.user.id);
  res.json(getJoin);
});

//add join
router.post('/officialAddJoin/:officialId', authMid.checkLogin, picnicController.postOfficialJoin);

// delete join
router.delete('/officialJoin/:officialId', authMid.checkLogin, picnicController.postOfficiaDeleteJoin);

// 詳細頁
router.get('/official/:officialId', picnicController.getPicnicDetail);

// --------- 開團活動 ---------
// 開團首頁列表
router.get('/group', picnicController.getPrivateList);

// get includes 此會員所有加入活動
router.get('/group/picnicAllJoin', authMid.checkLogin, async (req, res) => {
  let getJoin = await picnicModel.getJoinPicnic(req.session.user.id);
  res.json(getJoin);
});

// add join
router.post('/groupAddJoin/:groupId', authMid.checkLogin, picnicController.postPicnicJoin);

// delete join
router.delete('/groupJoin/:groupId', authMid.checkLogin, picnicController.postDeleteJoin);

// 開團列表詳細頁
router.get('/group/:groupId', picnicController.getPrivateDetail);

// 開團表單
const path = require('path');
const multer = require('multer'); //第三方套件
// const { log } = require('console');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'picnic'));
  },
  filename: function (req, file, cb) {
    // console.log('file', file);
    cb(null, file.originalname);
  },
});
const uploader = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // console.log('--- file ---', file);
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp') {
      cb(new Error('上傳的檔案型態不接受'), false);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 1000 * 1024,
  },
});

router.post('/create', uploader.single('image'), async (req, res) => {
  console.log(req.body, req.file);

  //TODO: 開團狀態處理？給預設值?
  let filename = req.file ? req.file.filename : '';
  let result = await pool.query(
    'INSERT INTO activity_picnic_private (location ,address, activity_date, join_limit, picnic_title, intr, start_date, end_date, img1, img2,create_user_id, activity_state, valid) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,1)',
    [
      req.body.location,
      req.body.address,
      req.body.activityDate,
      req.body.joinLimit,
      req.body.title,
      req.body.intr,
      req.body.startDate,
      req.body.endDate,
      filename,
      filename,
      req.session.user.id,
    ]
  );

  res.json({ Message: 'OK' });
  console.log('INSERT new result', result);
});

module.exports = router;
