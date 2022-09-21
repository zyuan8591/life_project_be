const pool = require('../utils/db');

async function getuser(user_id) {
  let [users] = await pool.execute('SELECT * FROM users WHERE id= ?', [user_id]);

  return users[0];
}

async function inspectionEmail(email) {
  let [users] = await pool.execute('SELECT * FROM users WHERE email= ?', [email]);
  return users;
}

async function putuser(name, birth, phone, gender, cityName, areaName, intro, filename, user_id) {
  await pool.execute('UPDATE users SET name = ? , birth = ? ,phone = ? ,gender=?, city = ? , area= ? ,intro = ? ,photo=? WHERE id=?', [
    name,
    birth,
    phone,
    gender,
    cityName,
    areaName,
    intro,
    filename,
    user_id,
  ]);
}

async function putpassword(hashPassword, user_id) {
  await pool.execute('UPDATE users SET password=? WHERE id=?', [hashPassword, user_id]);
}

module.exports = { getuser, putuser, putpassword, inspectionEmail };
