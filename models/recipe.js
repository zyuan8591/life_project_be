const pool = require('../utils/db');

async function getAllRecipeCount() {
  let [total] = await pool.execute('SELECT COUNT(*) AS total FROM recipe WHERE valid = 1');
  console.log(total);
  return total;
}
async function getRecipeList(sort, user, name, perPage, offset) {
  // Sort
  let sortSql = null;
  switch (sort) {
    case '1':
      sortSql = 'ORDER BY id ASC';
      break;
    case '2':
      sortSql = 'ORDER BY id DESC';
      break;
    default:
      sortSql = '';
      break;
  }

  // Search
  let userSearch = user ? `AND recipe.user_id = ${user}` : '';

  let [data] = await pool.query(
    `SELECT recipe.*, recipe_category.name AS recipe_category_name, product_category.name AS product_category_name FROM recipe 
    JOIN recipe_category ON recipe.category = recipe_category.id 
    JOIN product_category ON recipe.product_category = product_category.id
    WHERE valid = 1 ${userSearch} AND recipe.name LIKE ? ${sortSql} LIMIT ? OFFSET ?`,
    [`%${name}%`, perPage, offset]
  );

  // console.log(data);

  return data;
}

async function getRecipeById(id) {
  let [data] = await pool.query('SELECT * FROM recipe WHERE id = ?', [id]);
  return data;
}

async function getMaterialById(id) {
  let [data] = await pool.query('SELECT * FROM recipe_material WHERE recipe_id = ?', [id]);
  return data;
}

async function getStepById(id) {
  let [data] = await pool.query('SELECT * FROM recipe_step WHERE recipe_id = ?', [id]);
  return data;
}

async function getRecipeCateList() {
  let [data] = await pool.execute('SELECT * FROM recipe_category');
  console.log(data);
  return data;
}

module.exports = { getAllRecipeCount, getRecipeList, getRecipeById, getMaterialById, getStepById, getRecipeCateList };
