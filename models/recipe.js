const pool = require('../utils/db');

async function getRecipeCount(user, name = '', recipeId) {
  // Search
  let userSearch = user ? `AND recipe.user_id = ${user}` : '';
  let total = null;
  if (recipeId.length !== 0) {
    total = await pool.query(
      `SELECT COUNT(*) AS total FROM recipe 
      WHERE valid = 1 ${userSearch} AND recipe.name LIKE ? AND recipe.id IN (?)`,
      [`%${name}%`, recipeId]
    );
  } else {
    total = await pool.query(
      `SELECT COUNT(*) AS total FROM recipe 
      WHERE valid = 1 ${userSearch} AND recipe.name LIKE ?`,
      [`%${name}%`]
    );
  }
  return total[0][0].total;
}

async function getRecipeList(sort, user, name, perPage, offset, recipeId) {
  // Sort
  let sortSql = null;
  switch (sort) {
    case '1':
      sortSql = 'ORDER BY create_time ASC';
      break;
    case '2':
      sortSql = 'ORDER BY create_time DESC';
      break;
    default:
      sortSql = '';
      break;
  }
  console.log(sort);
  // Search
  let userSearch = user ? `AND recipe.user_id = ${user}` : '';

  let data = null;
  if (recipeId.length !== 0) {
    data = await pool.query(
      `SELECT recipe.*, recipe_category.name AS recipe_category_name, product_category.name AS product_category_name, COUNT(DISTINCT recipe_comment.id) AS comments, COUNT(DISTINCT recipe_like.id) AS likes 
      FROM recipe 
      JOIN recipe_category ON recipe.category = recipe_category.id 
      JOIN product_category ON recipe.product_category = product_category.id
      LEFT JOIN recipe_comment ON recipe.id = recipe_comment.recipe_id
      LEFT JOIN recipe_like ON recipe.id = recipe_like.recipe_id
      WHERE recipe.valid = 1 ${userSearch} AND recipe.name LIKE ? AND recipe.id IN (?)
      GROUP BY recipe.id
      ${sortSql} 
      LIMIT ? OFFSET ?`,
      [`%${name}%`, recipeId, perPage, offset]
    );
  } else {
    data = await pool.query(
      `SELECT recipe.*, recipe_category.name AS recipe_category_name, product_category.name AS product_category_name, COUNT(DISTINCT recipe_comment.id) AS comments, COUNT(DISTINCT recipe_like.id) AS likes 
      FROM recipe 
      JOIN recipe_category ON recipe.category = recipe_category.id 
      JOIN product_category ON recipe.product_category = product_category.id
      LEFT JOIN recipe_comment ON recipe.id = recipe_comment.recipe_id
      LEFT JOIN recipe_like ON recipe.id = recipe_like.recipe_id
      WHERE recipe.valid = 1 ${userSearch} AND recipe.name LIKE ?
      GROUP BY recipe.id
      ${sortSql} 
      LIMIT ? OFFSET ?`,
      [`%${name}%`, perPage, offset]
    );
  }

  return data[0];
}

async function getRecipeById(id) {
  let [data] = await pool.query('SELECT * FROM recipe WHERE id in ?', [id]);
  return data;
}

async function getMaterialById(id) {
  let [data] = await pool.query('SELECT * FROM recipe_material WHERE recipe_id = ?', [id]);
  return data;
}

async function getMaterialByName(name = '') {
  let [data] = await pool.execute('SELECT * FROM recipe_material WHERE name LIKE ?', [`%${name}%`]);
  data = data.map((d) => d.recipe_id);
  return data;
}

async function getStepById(id) {
  let [data] = await pool.query('SELECT * FROM recipe_step WHERE recipe_id = ?', [id]);
  return data;
}

async function getRecipeCateList() {
  let [data] = await pool.execute('SELECT * FROM recipe_category');
  return data;
}

async function getRecipeCommentById(id) {
  let [data] = await pool.execute('SELECT * FROM recipe_comment WHERE recipe_id = ?', [id]);
  return data;
}

// async function

module.exports = {
  getRecipeCount,
  getRecipeList,
  getRecipeById,
  getMaterialById,
  getMaterialByName,
  getStepById,
  getRecipeCateList,
  getRecipeCommentById,
};
