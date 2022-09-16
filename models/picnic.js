const pool = require('../utils/db');

// ------- 開團頁 join -------
// 確認是否有此活動
async function getJoinById(groupId) {
  let [result] = await pool.execute('SELECT * FROM activity_picnic_private_join WHERE picnic_id = ?', [groupId]);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}
// add join
async function addJoinPicnic(userId, groupId) {
  let [result] = await pool.execute('INSERT INTO activity_picnic_private_join ( join_user_id, picnic_id) VALUES (?,?)', [userId, groupId]);
  console.log('addJoinPicnic', result);
}
// 此會員所有加入活動
async function getJoinPicnic(userId) {
  let [result] = await pool.execute('SELECT * FROM activity_picnic_private_join WHERE join_user_id = ?', [userId]);
  return result;
}
module.exports = { getJoinById, addJoinPicnic, getJoinPicnic };
