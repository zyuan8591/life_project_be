const pool = require('../utils/db');

async function getProductList(req, res) {
  let data = await pool.query('SELECT * FROM product');
  // console.log(data[0]);
  return data[0];
}

async function getProductCategory(req, res) {
  let data = await pool.query('SELECT * FROM product_category');
  // console.log(data[0]);
  return data[0];
}

module.exports = { getProductList, getProductCategory };
