const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// --------------- 官方頁 ---------------
// 列表首頁
router.get('/official', async (req, res) => {
  const searchWord = req.query.searchWord ? req.query.searchWord : '';
  //   const filterState = req.query.filterState ? req.query.filterState : '';
  //   const priceRange = req.query.priceRange ? req.query.priceRange : '';
  let activitySort = req.query.activitySort ? req.query.activitySort : '1';

  let sortSql;
  switch (activitySort) {
    case '0':
      sortSql = 'activity_pincnic_official.activity_date DESC';
      break;
    case '1':
      sortSql = 'activity_pincnic_official.activity_date ASC';
      break;
    case '2':
      sortSql = 'activity_pincnic_official.price ASC';
      break;
    case '3':
      sortSql = 'activity_pincnic_official.price DESC';
      break;
    default:
  }
  //console.log('sortSql', sortSql);
  //console.log('activitySort', req.query.activitySort);
  let [totalData] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE activity_pincnic_official.picnic_title LIKE ?`,
    [`%${searchWord}%`]
  );
  //   console.log(totalData);
  const page = req.query.page ? req.query.page : 1;
  const perPage = 12;
  const total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  // let userSearch = user ? `AND recipe.user_id = ${user}` : '';
  // 自訂變數名 = 搜尋列 前端req.query的 ? `AND 欄位 = : ;`
  //  let filterBtn = filterState ? `AND activity_pincnic_official.activity_state = ${filterState}` : '';
  //   let filterPrice = priceRange ? `activity_pincnic_official.price = ${priceRange}` : '';
  let [data] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE activity_pincnic_official.picnic_title LIKE ? ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [`%${searchWord}%`, perPage, offset]
  );
  //   console.log('sortSql', sortSql);
  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [officialJoin] = await pool.execute(`SELECT * FROM activity_picnic_official_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], officialJoin: officialJoin.length };
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
// 列表詳細頁
router.get('/official/:officialId', async (req, res) => {
  const officialId = req.params.officialId;
  let [data] = await pool.execute('SELECT * FROM activity_pincnic_official WHERE id=?', [officialId]);
  res.json(data);
});

// --------------- 私人頁 ---------------

module.exports = router;
