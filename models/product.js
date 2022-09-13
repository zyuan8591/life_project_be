const pool = require('../utils/db');

async function getProductList() {
  let data = await pool.query('SELECT * FROM product');
  console.log(data);
}

module.exports = { getProductList };
