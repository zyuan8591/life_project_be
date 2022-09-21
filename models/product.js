const pool = require('../utils/db');

async function getProductCount(productName = '', productCate, brand, smallThan, biggerThan) {
  let productCateSql = '';
  let productBrandSql = '';
  let biggerThanSql = '';
  let smallThanSql = '';
  console.log('count', brand);
  parseInt(productCate) ? (productCateSql = `AND category = ${productCate}`) : '';
  parseInt(brand) ? (productBrandSql = `AND company_id in (${brand})`) : '';
  parseInt(biggerThan) ? (biggerThanSql = ` AND price >= ${biggerThan}`) : '';
  parseInt(smallThan) ? (smallThanSql = ` AND price <= ${smallThan}`) : '';
  let total = await pool.query(
    `SELECT COUNT(*) AS total FROM product WHERE valid = 1 ${productCateSql} ${productBrandSql} ${biggerThanSql} ${smallThanSql} AND product.name LIKE ?`,
    [`%${productName}%`]
  );
  // console.log(total[0][0].total);
  return total[0][0].total;
}

async function getProductList(productName = '', productCate, perPage, offset, brand, smallThan, biggerThan, sort) {
  // sort
  let sortSql = null;

  if (sort == 1) {
    sortSql = 'ORDER BY id DESC';
  } else if (sort == 2) {
    sortSql = 'ORDER BY created_time DESC';
  } else if (sort == 3) {
    sortSql = 'ORDER BY company_id ASC';
  } else {
    sortSql = '';
  }
  // category
  let productCateSql = '';
  let productBrandSql = '';
  let biggerThanSql = '';
  let smallThanSql = '';
  console.log('productCate', productCate);
  console.log('productName', productName);
  console.log('biggerThan', biggerThan);
  console.log('smallThan', smallThan);
  // console.log('brand', brand);
  parseInt(productCate) ? (productCateSql = `AND category = ${productCate}`) : '';
  parseInt(brand) ? (productBrandSql = `AND company_id IN (${brand})`) : '';
  parseInt(biggerThan) ? (biggerThanSql = ` AND price >= ${biggerThan}`) : '';
  parseInt(smallThan) ? (smallThanSql = ` AND price <= ${smallThan}`) : '';
  let data = await pool.query(
    `SELECT product.*, product_category.name AS product_category_name, company.name AS brand FROM product JOIN product_category ON product.category = product_category.id JOIN company ON product.company_id = company.id WHERE valid = 1 ${productCateSql} ${productBrandSql} ${biggerThanSql} ${smallThanSql} AND product.name LIKE ? ${sortSql} LIMIT ? OFFSET ?`,
    [`%${productName}%`, perPage, offset]
  );
  console.log('productCateSql', productCateSql);
  // console.log(data[0]);
  return data[0];
}

async function getProductCategory() {
  let data = await pool.query('SELECT * FROM product_category');
  // console.log(data[0]);
  return data[0];
}

async function getProductById(id) {
  let [data] = await pool.query(
    `SELECT product.*, product_category.name AS product_category_name, company.name AS brand FROM product JOIN product_category ON product.category = product_category.id JOIN company ON product.company_id = company.id WHERE product.id in (?)`,
    [id]
  );
  // console.log(data);
  return data;
}

async function getBrandList(brand) {
  // console.log(brand);
  let [data] = await pool.query(`SELECT * FROM company WHERE name LIKE ?`, [`%${brand}%`]);
  // console.log(data);
  return data;
}

async function getProductDetailImg(id) {
  let [data] = await pool.query(`SELECT * FROM product_detail WHERE product_id = ?`, [id]);
  return data;
}

async function getProductComment(id) {
  let [data] = await pool.query(
    `SELECT product_comment.*, users.photo, users.name FROM product_comment JOIN users ON product_comment.user_id = users.id WHERE product_id = ? ORDER BY create_time DESC`,
    [id]
  );
  return data;
}

async function writeProductComment(user_id, writeComment, id, time, star) {
  let result = await pool.execute(`INSERT INTO product_comment (user_id, comment, product_id, create_time, star) VALUES (?, ?, ?, ?, ?)`, [user_id, writeComment, id, time, star]);
  console.log(result);
}

async function addProductLike(user_id, id) {
  let result = await pool.execute(`INSERT INTO product_like (user_id, product_id) VALUES (?, ?)`, [user_id, id]);
  console.log(result);
}

async function getProductLike(user_id) {
  let [data] = await pool.query(
    `SELECT product_like.*, product.name, product.img, product.color FROM product_like JOIN product ON product_like.product_id = product.id WHERE user_id = ? `,
    [user_id]
  );
  console.log('getLike', user_id);
  return data;
}

async function removeProductLike(user_id, id) {
  let result = await pool.query(`DELETE FROM product_like WHERE user_id = ? AND product_id = ?`, [user_id, id]);
  console.log('remove', result);
}

async function getRandomProductNumber(category) {
  let [randomNumber] = await pool.query(`SELECT id FROM product WHERE category = ?`, [category]);

  return randomNumber;
}

async function getRandomProductRecommend(randomProductNumber) {
  let [data] = await pool.query(`SELECT * FROM product WHERE id in (?) `, [randomProductNumber]);

  return data;
}
async function getUserProductLike(user_id) {
  let [data] = await pool.query(
    `SELECT product_like.*, product.name, product.img, product.color FROM product_like JOIN product ON product_like.product_id = product.id WHERE user_id = ? `,
    [user_id]
  );
  // console.log('getLike', user_id);
  return data;
}


module.exports = {
  getProductList,
  getProductCategory,
  getProductById,
  getBrandList,
  getProductDetailImg,
  getProductCount,
  getProductComment,
  writeProductComment,
  addProductLike,
  getProductLike,
  removeProductLike,
  getRandomProductNumber,
  getRandomProductRecommend,
  getUserProductLike,
};
