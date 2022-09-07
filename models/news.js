const pool = require('../utils/db');

async function getAllNews() {
  let [data] = await pool.query(`SELECT news.*, news_category.name AS categoryName FROM news JOIN news_category ON news.category = news_category.id `);
  return data;
}

module.exports = { getAllNews };
