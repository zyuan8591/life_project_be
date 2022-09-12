const pool = require('../utils/db');

async function getMapList(req, res) {
  // 未分頁
  let [result] = await pool.execute('SELECT * FROM activity_camping');

  res.json({ result });
}

module.exports = {
  getMapList,
};
