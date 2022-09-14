const pool = require('../utils/db');

async function getProductList() {
  let data = await pool.query('SELECT * FROM product');
  console.log(data[0]);
  return data[0];
}

async function getProductCategory() {
  let data = await pool.query('SELECT * FROM product_category');
  console.log(data[0]);
  return data[0];
}

module.exports = { getProductList, getProductCategory };
