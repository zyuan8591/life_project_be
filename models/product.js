const pool = require('../utils/db');

async function getProductCount(productId, productCate) {
  // let productSearch = productId ? `product.id= ${productId}` : '';
  // let productCateSql = '';
  // parseInt(productCate) ? (productCateSql = `AND product.category = ${productCate}`) : '';
  // let total = null;
  // if (productId.length !== 0) {
  //   total = await pool.query(`SELECT COUNT(*) AS total FROM product WHERE ${productSearch} ${productCateSql} AND product.id IN (?)`, [productId]);
  // } else {
  //   total = await pool.query(`SELECT COUNT(*) AS total FROM product WHERE ${productSearch} ${productCateSql}`);
  // }
  // console.log(total);
  // return total;
  let total = await pool.query(`SELECT COUNT(*) AS total FROM product`);
  // console.log(total[0][0].total);
  return total[0][0].total;
}

async function getProductList(productName, productCate, perPage, offset, brand) {
  // filter for category
  let productCateSql = '';
  let productBrandSql = '';
  console.log('productCate', productCate);
  console.log('productName', productName);
  console.log('brand', brand);
  parseInt(productCate) ? (productCateSql = `AND category = ${productCate}`) : '';
  parseInt(brand) ? (productBrandSql = `AND company_id = ${brand}`) : '';
  let data = await pool.query(
    `SELECT product.*, product_category.name AS product_category_name, company.name AS brand FROM product JOIN product_category ON product.category = product_category.id JOIN company ON product.company_id = company.id WHERE valid = 1 ${productCateSql} ${productBrandSql} AND product.name LIKE ? LIMIT ? OFFSET ?`,
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
  let [data] = await pool.query(`SELECT * FROM company WHERE name LIKE ?`, [`%${brand}%`]);
  console.log(data);
  return data;
}

async function getProductDetailImg(id) {
  let [data] = await pool.query(`SELECT * FROM product_detail WHERE product_id = ?`, [id]);
  return data;
}

module.exports = { getProductList, getProductCategory, getProductById, getBrandList, getProductDetailImg, getProductCount };
