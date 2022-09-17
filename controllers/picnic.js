const pool = require('../utils/db');
const moment = require('moment');
const picnicModel = require('../models/picnic');

//----------------------- 官方活動 ------------------------
async function getPicnicList(req, res) {
  //   console.log(req.query);
  const searchWord = req.query.searchWord ? req.query.searchWord : '';
  const filterState = req.query.filterState ? req.query.filterState : '';
  const minPrice = req.query.minPrice ? req.query.minPrice : 0;
  const maxPrice = req.query.maxPrice ? req.query.maxPrice : 2500;
  const minJoinPeople = req.query.minJoinPeople ? req.query.minJoinPeople : 0;
  const maxJoinPeople = req.query.maxJoinPeople ? req.query.maxJoinPeople : 30;
  const minDate = req.query.minDate ? req.query.minDate : '';
  const maxDate = req.query.maxDate ? req.query.maxDate : '';
  let activitySort = req.query.activitySort ? req.query.activitySort : '0';

  let sortSql;
  switch (activitySort) {
    case '0':
      sortSql = 'activity_pincnic_official.start_date DESC';
      break;
    case '1':
      sortSql = 'activity_pincnic_official.start_date ASC';
      break;
    case '2':
      sortSql = 'activity_pincnic_official.price DESC';
      break;
    case '3':
      sortSql = 'activity_pincnic_official.price ASC';
      break;
    default:
  }
  // console.log('sortSql', sortSql);
  // let todayDate = Number(moment().format('YYYYMMDD'));
  // console.log('todayDate', todayDate);
  // let [commingDateToStartDate] = await pool.execute(
  //   'UPDATE activity_pincnic_official SET activity_state = 2 WHERE todayDate < start_date AND todayDate < end_date AND activity_state = 1'
  // );
  // let [satrtDateToEndDate] = await pool.execute(
  //   'UPDATE activity_pincnic_official SET activity_state = 4 WHERE todayDate > start_date AND todayDate > end_date AND activity_state = 2'
  // );

  let filterBtn = filterState ? `AND activity_picnic_state.id = ${filterState}` : '';
  let filterPrice = minPrice || maxPrice ? `AND (price BETWEEN ${minPrice} AND ${maxPrice})` : '';
  let filterJoinPeople = minJoinPeople || maxJoinPeople ? `AND (join_limit BETWEEN ${minJoinPeople} AND ${maxJoinPeople})` : '';
  let filterDate = maxDate || minDate ? `AND (start_date >= '${minDate}' AND end_date <= '${maxDate}')` : '';
  //   console.log(filterDate);

  let [totalData] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterPrice} ${filterJoinPeople} ${filterDate} AND activity_pincnic_official.picnic_title LIKE ?`,
    [`%${searchWord}%`]
  );

  const page = req.query.page ? req.query.page : 1;
  const perPage = 12;
  let total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  // console.log(typeof req.query.filterState);

  let [data] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterPrice} ${filterJoinPeople} ${filterDate} AND activity_pincnic_official.picnic_title LIKE ? ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [`%${searchWord}%`, perPage, offset]
  );

  // 報名總人數
  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_official_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }

  // data.map((data) => {

  //   if (data.start_date > todayDate && todayDate < data.end_date) filterState(1); // 即將開團
  //   if (data.start_date < todayDate && todayDate > data.end_date) filterState(2); // 開團中
  //   if (data.join_limit === data.currentJoin) filterState(3); // 開團中
  //   if (data.start_date > todayDate && todayDate > data.end_date) filterState(4); // 開團已截止
  // });

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
  });
}

async function getPicnicDetail(req, res) {
  const officialId = req.params.officialId;
  let [data] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official
    JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );
  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_official_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }

  //主辦人
  let [paicipantData] = await pool.execute(
    `SELECT activity_picnic_official_join.*, users.* , activity_pincnic_official.* FROM activity_picnic_official_join
  JOIN users ON activity_picnic_official_join.user_id = users.id 
  JOIN activity_pincnic_official ON activity_pincnic_official.id = activity_picnic_official_join.picnic_id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );

  //推薦商品
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
}

// add join
async function postOfficialJoin(req, res) {
  let picnic = await picnicModel.getJoinId(req.params.officialId);
  // console.log(req.params.officialId);
  if (!picnic) {
    return res.json({ message: '查無此活動' });
  }
  await picnicModel.addJoinOfficial(req.session.user.id, req.params.officialId);
  let getJoin = await picnicModel.getJoinOfficial(req.session.user.id);
  res.json({ message: 'ok', getJoin });
}

//
async function postOfficiaDeleteJoin(req, res) {
  await picnicModel.deleteJoinOfficial(req.session.user.id, req.params.officialId);
  let getJoin = await picnicModel.getJoinOfficial(req.session.user.id);
  res.json({ message: 'ok delete', getJoin });
}

// ----------------------- 開團活動 ----------------------
async function getPrivateList(req, res) {
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

  let filterBtn = filterState ? `AND activity_picnic_state.id = ${filterState}` : '';
  let filterJoinPeople = minJoinPeople || maxJoinPeople ? `AND (join_limit BETWEEN ${minJoinPeople} AND ${maxJoinPeople})` : '';
  let filterDate = maxDate || minDate ? `AND (start_date >= '${minDate}' AND end_date <= '${maxDate}')` : '';
  // console.log(minJoinPeople, maxJoinPeople);

  let [totalData] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterJoinPeople} ${filterDate} AND activity_picnic_private.picnic_title LIKE ?`,
    [`%${searchWord}%`]
  );

  const page = req.query.page ? req.query.page : 1;
  const perPage = 12;
  const total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterJoinPeople} ${filterDate} AND activity_picnic_private.picnic_title LIKE ? ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [`%${searchWord}%`, perPage, offset]
  );
  for (let i = 0; i < data.length; i++) {
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_private_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }
  console.log(data);
  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
  });
}

async function getPrivateDetail(req, res) {
  const groupId = req.params.groupId;
  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private
    JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_private_join WHERE picnic_id = ${data[i].id}`);
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
}

// add join
async function postPicnicJoin(req, res) {
  let picnic = await picnicModel.getJoinById(req.params.groupId);
  if (!picnic) {
    return res.json({ message: '查無此活動' });
  }
  // 新增後回傳最新資料
  await picnicModel.addJoinPicnic(req.session.user.id, req.params.groupId);
  let getJoin = await picnicModel.getJoinPicnic(req.session.user.id);
  res.json({ message: 'ok', getJoin });
}

// delete
async function postDeleteJoin(req, res) {
  await picnicModel.deleteJoinPicnic(req.session.user.id, req.params.groupId);
  let getJoin = await picnicModel.getJoinPicnic(req.session.user.id);
  res.json({ message: 'ok', getJoin });
}
module.exports = {
  getPicnicList,
  getPicnicDetail,
  postOfficialJoin,
  postOfficiaDeleteJoin,
  getPrivateList,
  getPrivateDetail,
  postPicnicJoin,
  postDeleteJoin,
};
