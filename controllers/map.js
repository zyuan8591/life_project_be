const pool = require('../utils/db');

// /api/1.0/map?type=1 & distance=1 & county=1 & area=1
async function getMapList(req, res) {
  const { type, distance } = req.query;

  let typeSelect = type ? `AND type=${type}` : '';
  // let distanceSelect = type ? `AND type=${distance}` : '';

  //distance
  let [disResult] = await pool.execute(
    `SELECT id,( 3959 * acos( cos( radians(25.0259029) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(121.5703875)) + sin(radians(25.0259029)) * sin( radians(lat)))) AS distance FROM activity_map WHERE valid = 1 HAVING distance < 10 ORDER BY distance`
  );
  const disLength = disResult.length;

  // result
  let [result] = await pool.execute(`SELECT * FROM activity_map WHERE valid=1 ${typeSelect}`);

  let [allResult] = await pool.execute(
    `SELECT * ,( 3959 * acos( cos( radians(25.0259029) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(121.5703875)) + sin(radians(25.0259029)) * sin( radians(lat)))) AS distance FROM activity_map WHERE valid=1 ${typeSelect} HAVING distance < 10`
  );
  res.json({ disLength, result, disResult, allResult });
}

module.exports = {
  getMapList,
};
