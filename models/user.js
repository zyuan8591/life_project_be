const pool = require('../utils/db');
//確認有無此id
async function getuser(user_id) {
  let [users] = await pool.execute('SELECT * FROM users WHERE id= ?', [user_id]);

  return users[0];
}
//確認有無此信箱
async function inspectionEmail(email) {
  let [users] = await pool.execute('SELECT * FROM users WHERE email= ?', [email]);
  return users;
}
//更新會員資料
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
//更新密碼
async function putpassword(hashPassword, user_id) {
  await pool.execute('UPDATE users SET password=? WHERE id=?', [hashPassword, user_id]);
}
//取得會員點數
async function getpoints(user_id) {
  let [data] = await pool.execute('SELECT * FROM user_points WHERE user_id = ?', [user_id]);
  return data;
}

//寫進點數資料庫
async function postpoints(user_id, point, event, creatTime) {
  await pool.execute('INSERT INTO user_points (user_id,point,event,time) VALUES(?,?,?,?)', [user_id, point, event, creatTime]);
}

module.exports = { getuser, putuser, putpassword, inspectionEmail, getpoints, postpoints };
