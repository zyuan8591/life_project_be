const pool = require('../utils/db');

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
}

module.exports = {
  getPicnicList,
};
