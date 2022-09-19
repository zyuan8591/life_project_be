const pool = require('../utils/db');

async function getProductCount(productName, productCate, brand, smallThan, biggerThan) {
  let productCateSql = '';
  let productBrandSql = '';
  let biggerThanSql = '';
  let smallThanSql = '';
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
  switch (sort) {
    case '1':
      sortSql = 'ORDER BY id DESC';
      break;
    case '2':
      sortSql = 'ORDER BY created_time DESC';
      break;
    default:
      sortSql = '';
      break;
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
  console.log(data[0]);
  return data[0];
}

async function getProductById(id) {
  let [data] = await pool.query(
    `SELECT product.*, product_category.name AS product_category_name, company.name AS brand FROM product JOIN product_category ON product.category = product_category.id JOIN company ON product.company_id = company.id WHERE product.id = (?)`,
    [id]
  );
  console.log(data);
  return data;
}

async function getBrandList(brand) {
  // let [data] = await pool.query(`SELECT * FROM company `);
  // let productCateSql = '';
  // parseInt(productCate) ? (productCateSql = `AND category = ${productCate}`) : '';
  console.log(brand);
  let [data] = await pool.query(`SELECT * FROM company WHERE name LIKE ?`, [`%${brand}%`]);
  console.log(data);
  return data;
}

async function getProductDetailImg(id) {
  let [data] = await pool.query(`SELECT * FROM product_detail WHERE product_id = ?`, [id]);
  return data;
}

module.exports = { getProductList, getProductCategory, getProductById, getBrandList, getProductDetailImg, getProductCount };
