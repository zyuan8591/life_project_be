const pool = require('../utils/db');

async function getAllNews(cate = '') {
  let cateFilter = '';
  if (cate) cateFilter = `WHERE category = ${cate}`;
  let [data] = await pool.query(
    `SELECT news.*, news_category.name AS categoryName FROM news JOIN news_category ON news.category = news_category.id ${cateFilter} ORDER BY id DESC`
  );

  return data;
}

async function getAllCategory() {
  let [data] = await pool.execute(`SELECT * FROM news_category`);
  return data;
}

module.exports = { getAllNews, getAllCategory };
