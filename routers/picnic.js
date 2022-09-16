const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const picnicController = require('../controllers/picnic');
const authMid = require('../middlewares/auth');
const picnicModel = require('../models/picnic');

// --------- 官方活動 ---------
// 首頁列表
router.get('/official', picnicController.getPicnicList);

// 列表詳細頁
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

// 開團列表詳細頁
router.get('/group/:groupId', async (req, res) => {
  const groupId = req.params.groupId;
  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private
    JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_official_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }

  //活動主辦人
  let [organiserData] = await pool.execute(
    'SELECT activity_picnic_private.* , users.* FROM activity_picnic_private JOIN users ON activity_picnic_private.create_user_id = users.id WHERE activity_picnic_private.id=?',
    [groupId]
  );

  //活動參與者
  let [paicipantData] = await pool.execute(
    `SELECT activity_picnic_private_join.*, users.* , activity_picnic_private.* FROM activity_picnic_private_join JOIN users ON activity_picnic_private_join.join_user_id = users.id JOIN activity_picnic_private ON activity_picnic_private.id = activity_picnic_private_join.picnic_id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  //推薦商品
  let [productsData] = await pool.execute(
    `SELECT picnic_private_recommend_product.*, product.*, activity_picnic_private.* FROM picnic_private_recommend_product
  JOIN product ON picnic_private_recommend_product.product_id = product.id 
  JOIN activity_picnic_private ON picnic_private_recommend_product.picnic_id = activity_picnic_private.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  res.json({ data, organiserData, paicipantData, productsData });
});
// --------------- 私人開團表單 ---------------
const path = require('path');
const multer = require('multer'); //第三方套件
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'picnic'));
  },
  filename: function (req, file, cb) {
    // console.log('file', file);
    const ext = file.originalname.split('.').pop();
    cb(null, `activity-${Date.now()}.${ext}`);
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
  let filename = req.file ? '/uploads/' + req.file.filename : '';
  let result = await pool.execute(
    'INSERT INTO activity_picnic_private (location ,address, activity_date, join_limit, picnic_title, intr, start_date, end_date, img1, activity_state, valid) VALUES (?,?,?,?,?,?,?,?,?,1,1)',
    [req.body.location, req.body.address, req.body.activityDate, req.body.joinLimit, req.body.title, req.body.intr, req.body.startDate, req.body.endDate, filename]
  );

  res.json({ Message: 'OK' });
  console.log('INSERT new result', result);
});

module.exports = router;
