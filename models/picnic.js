const pool = require('../utils/db');

// ------- 官方活動 join -------
async function getJoinId(officialId) {
  let [result] = await pool.execute('SELECT * FROM activity_picnic_official_join WHERE picnic_id = ?', [officialId]);
  console.log(result);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

//add join
async function addJoinOfficial(userId, officialId) {
  let [result] = await pool.execute('INSERT INTO activity_picnic_official_join(user_id, picnic_id) VALUES (?,?)', [userId, officialId]);
  console.log('addJoinOfficial', result);
}

async function getJoinOfficial(user_id) {
  console.log(user_id);
  let [result] = await pool.execute('SELECT * FROM activity_picnic_official_join WHERE user_id = ?', [user_id]);
  return result;
}

// delete
async function deleteJoinOfficial(userId, officialId) {
  let [result] = await pool.execute('DELETE FROM activity_picnic_official_join WHERE user_id = ? AND picnic_id = ?', [userId, officialId]);
  console.log('deleteJoin', result);
}

// ------- 開團活動 join -------
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

// delete
async function deleteJoinPicnic(userId, groupId) {
  let [result] = await pool.execute('DELETE FROM activity_picnic_private_join WHERE join_user_id = ? AND picnic_id = ?', [userId, groupId]);
  console.log('deleteJoin', result);
}
module.exports = { getJoinId, addJoinOfficial, getJoinOfficial, deleteJoinOfficial, getJoinById, addJoinPicnic, getJoinPicnic, deleteJoinPicnic };
