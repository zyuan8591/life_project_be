const pool = require('../utils/db');
const moment = require('moment');
const campingModel = require('../models/camping');
// campingData
// /api/1.0/camping?state=1 & maxPrice=100 & minPrice=50 & maxPerson=20 & minPerson=10 & maxDate=20221010 & minPrice=20220910 & order=1 & search & page
async function getCampingList(req, res) {
  const { state, maxPrice, minPrice, maxDate, minDate, order, search, maxJoinTtl, minJoinTtl } = req.query;
  const activityState = ['即將開團', '開團中', '已成團', '開團已截止'];

  // price & date
  // let priceCount = maxPrice || minPrice ? `AND (price<=${maxPrice} AND price>=${minPrice})` : '';
  // let joinCount = maxJoinTtl || minJoinTtl ? `AND (join_limit<=${maxJoinTtl} AND join_limit>=${minJoinTtl})` : '';
  let priceCount = maxPrice || minPrice ? `AND (price BETWEEN ${minPrice} AND ${maxPrice})` : '';
  let joinCount = maxJoinTtl || minJoinTtl ? `AND (join_limit BETWEEN ${minJoinTtl} AND ${maxJoinTtl})` : '';
  let startDateTime = maxDate || minDate ? `AND (activity_start_date BETWEEN '${minDate}' AND '${maxDate}')` : '';
  let endDateTime = maxDate || minDate ? `AND (activity_end_date BETWEEN '${minDate}' AND '${maxDate}')` : '';
  let titleSearch = search ? `AND title LIKE '%${search}%'` : '';
  // orderType
  let orderType = null;
  switch (order) {
    case '1':
      orderType = 'activity_start_date ASC';
      break;
    case '2':
      orderType = 'activity_start_date DESC';
      break;
    case '3':
      orderType = 'price ASC';
      break;
    case '4':
      orderType = 'price DESC';
      break;
    default:
      orderType = 'id ASC';
  }

  // page
  const perPage = 12;
  const page = req.query.page || 1;
  // total
  let [total] = await pool.execute('SELECT COUNT(*) AS total FROM activity_camping WHERE valid = 1');
  total = total[0].total;
  // console.log(total);

  // total page --> lastpage
  let lastPage = Math.ceil(total / perPage);
  // console.log(lastPage);
  // offset
  const offset = perPage * (page - 1);

  // join location & join pepcount
  let [totalResult] = await pool.execute(
    `SELECT c.*,l.location,IFNULL(j.pep, 0) as pepcount FROM activity_camping c INNER JOIN activity_camping_location l ON l.id = c.location LEFT JOIN (SELECT count(1) AS pep,activity_id FROM activity_camping_join GROUP BY activity_id) j ON c.id = j.activity_id WHERE valid = 1 ${priceCount} ${startDateTime} ${endDateTime} ${titleSearch} ${joinCount} ORDER BY ${orderType} `
  );
  totalResult = totalResult.map((d) => {
    let todayDate = Number(moment().format('YYYYMMDD'));
    let startDate = parseInt(d.start_date.replace(/-/g, ''));
    let endDate = parseInt(d.end_date.replace(/-/g, ''));
    let state = '';
    let count = d.pepcount;
    if (startDate < todayDate && endDate < todayDate) state = activityState[3];
    if (startDate <= todayDate && endDate >= todayDate) state = activityState[1];
    if (d.join_limit === count) state = activityState[2];
    if (startDate > todayDate && endDate > todayDate) state = activityState[0];
    return { ...d, state };
  });

  if (state) {
    totalResult = totalResult.filter((d) => {
      return d.state === activityState[state - 1];
    });
  }
  // console.log('totalResult', totalResult, totalResult.length);
  let result = totalResult.slice(offset, offset + perPage);

  // filter total
  total = totalResult.length;
  lastPage = Math.ceil(total / perPage);
  // console.log(total, lastPage);
  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
  // res.json(result);
}

// /api/1.0/camping/1
async function getCampingDetail(req, res) {
  const campingId = req.params.campingId;
  // console.log(campingId);
  const activityState = ['即將開團', '開團中', '已成團', '開團已截止'];

  // 未分頁
  let [result] = await pool.execute(
    `SELECT c.*,IFNULL(j.pep, 0) AS pepcount FROM activity_camping c INNER JOIN activity_camping_location l ON l.id = c.location LEFT JOIN (SELECT count(1) AS pep,activity_id FROM activity_camping_join GROUP BY activity_id) j ON c.id = j.activity_id WHERE c.id=?`,
    [campingId]
  );

  result = result.map((d) => {
    let todayDate = Number(moment().format('YYYYMMDD'));
    let startDate = parseInt(d.start_date.replace(/-/g, ''));
    let endDate = parseInt(d.end_date.replace(/-/g, ''));
    let state = '';
    let count = d.pepcount;
    if (startDate < todayDate && endDate < todayDate) state = activityState[3];
    if (startDate <= todayDate && endDate >= todayDate) state = activityState[1];
    if (d.join_limit === count) state = activityState[2];
    if (startDate > todayDate && endDate > todayDate) state = activityState[0];
    return { ...d, state };
  });

  let [joinResult] = await pool.execute(`SELECT j.*, users.* FROM activity_camping_join j JOIN users ON j.user_id = users.id WHERE j.activity_id=?`, [campingId]);

  // console.log(result);
  res.json({ result, joinResult });
}

// /api/1.0/camping/campingCollect/1  add
async function postCampingCollect(req, res) {
  let camping = await campingModel.getCampingById(req.params.campingId);
  if (!camping) {
    return res.json({ message: '查無此活動' });
  }
  await campingModel.addCollectCamping(req.session.user.id, req.params.campingId);
  let getCamping = await campingModel.getCollectCamping(req.session.user.id);
  res.json({ message: 'ok', getCamping });
}

// delete
async function postDeleteCollect(req, res) {
  await campingModel.deleteCollectCamping(req.session.user.id, req.params.campingId);
  let getCamping = await campingModel.getCollectCamping(req.session.user.id);
  res.json({ message: 'ok', getCamping });
}

// /api/1.0/camping/campingCollected
// async function getCampingCollect(req, res) {
//   let getCamping = await campingModel.getCollectCamping(req.session.user.id);
//   // console.log(getCamping);
//   res.json(getCamping);
// }

// add join
async function postCampingJoin(req, res) {
  let camping = await campingModel.getJoinById(req.params.campingId);
  if (!camping) {
    return res.json({ message: '查無此活動' });
  }
  await campingModel.addJoinCamping(req.session.user.id, req.params.campingId);
  let getJoin = await campingModel.getJoinCamping(req.session.user.id);
  res.json({ message: 'ok', getJoin });
}

// add delete
async function postDeleteJoin(req, res) {
  await campingModel.deleteJoinCamping(req.session.user.id, req.params.campingId);
  let getJoin = await campingModel.getJoinCamping(req.session.user.id);
  res.json({ message: 'ok', getJoin });
}
// 會員
async function joinuser(req, res) {
  const userId = req.session.user.id;

  const activityState = ['即將開團', '開團中', '已成團', '開團已截止'];

  const perPage = 5;
  const page = req.query.page || 1;
  // total
  let [total] = await pool.execute('SELECT COUNT(*) AS total FROM activity_camping WHERE valid = 1');
  total = total[0].total;

  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  let [userResult] = await pool.execute(`SELECT j.*, users.id FROM activity_camping_join j JOIN users ON j.user_id = users.id WHERE j.user_id=?`, [userId]);

  let campingIds = userResult.map((users) => users.activity_id);
  // console.log(campingIds);
  if (campingIds.length === 0) {
    return res.json({ pagination: { total: 0, perPage: 5, page: 1, lastPage: 0 }, result: [] });
  }
  let [joinResult] = await pool.query(`SELECT * FROM activity_camping WHERE id in (?)`, [campingIds]);
  // console.log(joinResult);

  // console.log(joinResult.length);

  joinResult = joinResult.map((d) => {
    let todayDate = Number(moment().format('YYYYMMDD'));
    let startDate = parseInt(d.start_date.replace(/-/g, ''));
    let endDate = parseInt(d.end_date.replace(/-/g, ''));
    let state = '';
    let count = d.pepcount;
    if (startDate < todayDate && endDate < todayDate) state = activityState[3];
    if (startDate <= todayDate && endDate >= todayDate) state = activityState[1];
    if (d.join_limit === count) state = activityState[2];
    if (startDate > todayDate && endDate > todayDate) state = activityState[0];
    return { ...d, state };
  });

  // console.log('totalResult', totalResult, totalResult.length);
  let result = joinResult.slice(offset, offset + perPage);

  // filter total
  total = joinResult.length;
  lastPage = Math.ceil(total / perPage);
  // console.log(total, lastPage);
  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}

// user collect
async function userCollects(req, res) {
  //
  let [collectResult] = await pool.execute('SELECT * FROM activity_camping_collect WHERE user_id = ?', [req.session.user.id]);

  let campingIds = collectResult.map((users) => users.activity_id);

  if (campingIds.length === 0) {
    return res.json({ pagination: { total: 0, perPage: 5, page: 1, lastPage: 0 }, result: [] });
  }
  // console.log(userId);
  // console.log('collectResult', collectResult);

  let [result] = await pool.query(`SELECT * FROM activity_camping WHERE id in (?)`, [campingIds]);
  // console.log(result);
  //
  let total = result.length;
  // console.log(total);
  const perPage = 5;
  const page = req.query.page || 1;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  result = result.slice(offset, offset + perPage);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}

module.exports = {
  getCampingList,
  getCampingDetail,
  postCampingCollect,
  postDeleteCollect,
  // getCampingCollect,
  postCampingJoin,
  postDeleteJoin,
  joinuser,
  userCollects,
};
