const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const picnicController = require('../controllers/picnic');
// --------------- 官方頁 ---------------
// 首頁列表
router.get('/official', picnicController.getPicnicList);

// 列表詳細頁
router.get('/official/:officialId', async (req, res) => {
  const officialId = req.params.officialId;
  let [data] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official
    JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );

  let [paicipantData] = await pool.execute(
    `SELECT activity_picnic_official_join.*, users.* , activity_pincnic_official.* FROM activity_picnic_official_join
  JOIN users ON activity_picnic_official_join.user_id = users.id 
  JOIN activity_pincnic_official ON activity_pincnic_official.id = activity_picnic_official_join.picnic_id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );

  let [productsData] = await pool.execute(
    `SELECT picnic_official_recommend_product.*, product.*, activity_pincnic_official.* FROM picnic_official_recommend_product
  JOIN product ON picnic_official_recommend_product.product_id = product.id 
  JOIN activity_pincnic_official ON picnic_official_recommend_product.picnic_id = activity_pincnic_official.id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );
  // console.log(productsData);
  //   SELECT * FROM `users` u
  // JOIN activity_picnic_official_join aj ON aj.user_id=u.id
  // JOIN activity_pincnic_official a ON a.id=aj.picnic_id
  // WHERE 1

  res.json({ data, paicipantData, productsData });
});

// --------------- 開團首頁列表 ---------------
router.get('/group', async (req, res) => {
  const searchWord = req.query.searchWord ? req.query.searchWord : '';
  const filterState = req.query.filterState ? req.query.filterState : '';
  const minJoinPeople = req.query.minJoinPeople ? req.query.minJoinPeople : 0;
  const maxJoinPeople = req.query.maxJoinPeople ? req.query.maxJoinPeople : 30;
  const minDate = req.query.minDate ? req.query.minDate : '';
  const maxDate = req.query.maxDate ? req.query.maxDate : '';
  let activitySort = req.query.activitySort ? req.query.activitySort : '0';

  let sortSql;
  switch (activitySort) {
    case '0':
      sortSql = 'activity_picnic_private.start_date DESC';
      break;
    case '1':
      sortSql = 'activity_picnic_private.start_date ASC';
      break;
    default:
  }

  let [totalData] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE activity_picnic_private.picnic_title LIKE ?`,
    [`%${searchWord}%`]
  );

  const page = req.query.page ? req.query.page : 1;
  const perPage = 12;
  const total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  let filterBtn = filterState ? `AND activity_picnic_state.id = ${filterState}` : '';
  let filterJoinPeople = minJoinPeople || maxJoinPeople ? `AND (join_limit BETWEEN ${minJoinPeople} AND ${maxJoinPeople})` : '';
  let filterDate = maxDate || minDate ? `AND (start_date >= '${minDate}' AND end_date <= '${maxDate}')` : '';
  // console.log(minJoinPeople, maxJoinPeople);

  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterJoinPeople} ${filterDate} AND activity_picnic_private.picnic_title LIKE ? ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [`%${searchWord}%`, perPage, offset]
  );

  for (let i = 0; i < data.length; i++) {
    let [privateJoin] = await pool.execute(`SELECT * FROM activity_picnic_private_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], privateJoin: privateJoin.length };
  }
  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
  });
});

// 開團列表詳細頁
router.get('/group/:groupId', async (req, res) => {
  const groupId = req.params.groupId;
  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private
    JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  let [paicipantData] = await pool.execute(
    `SELECT activity_picnic_private_join.*, users.* , activity_picnic_private.* FROM activity_picnic_private_join
    JOIN users ON activity_picnic_private_join.create_user_id = users.id
    JOIN users AS B ON activity_picnic_private_join.join_user_id = users.id
    JOIN activity_picnic_private ON activity_picnic_private.id = activity_picnic_private_join.picnic_id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  let [productsData] = await pool.execute(
    `SELECT picnic_private_recommend_product.*, product.*, activity_picnic_private.* FROM picnic_private_recommend_product
  JOIN product ON picnic_private_recommend_product.product_id = product.id 
  JOIN activity_picnic_private ON picnic_private_recommend_product.picnic_id = activity_picnic_private.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  res.json({ data, paicipantData, productsData });
});

// --------------- 私人開團表單 ---------------
// const path = require('path');
// const multer = require('multer'); //第三方套件
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '..', 'public', 'uploads'));
//   },
//   filename: function (req, file, cb) {
//     console.log('file', file);
//     const ext = file.originalname.split('.').pop();
//     cb(null, `activity-${Date.now()}.${ext}`);
//   },
// });
// const uploader = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     // console.log('--- file ---', file);
//     if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp') {
//       cb(new Error('上傳的檔案型態不接受'), false);
//     } else {
//       cb(null, true);
//     }
//   },
//   limits: {
//     fileSize: 500 * 1024,
//   },
// });

// router.post('/create', uploader.single('image'), async (req, res) => {
//   console.log(req.body, req.file);

//   // TODO: 無法撈出地區資料
//   let [locationData] = await pool.execute(
//     'SELECT activity_pincnic_official.*, activity_picnic_location.* FROM activity_pincnic_official JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id'
//   );
//   console.log(locationData);

//   //TODO: 開團狀態怎麼處理？給預設值?
//   let filename = req.file ? '/uploads/' + req.file.filename : '';
//   let result = await pool.execute(
//     'INSERT INTO activity_picnic_private (location ,address, activity_date, join_limit, picnic_title, intr, start_date, end_date, img1, valid) VALUES (?,?,?,?,?,?,?,?,?,1)',
//     [req.body.location, req.body.address, req.body.activityDate, req.body.joinLimit, req.body.title, req.body.intr, req.body.startDate, req.body.endDate, filename]
//   );
//   res.json({ Message: 'OK' });
//   console.log('INSERT new result', result);
// });
module.exports = router;
