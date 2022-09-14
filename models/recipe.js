const pool = require('../utils/db');

async function getRecipeCount(user, name = '', recipeId, recipeCate, productCate) {
  // Search
  let userSearch = user ? `AND recipe.user_id = ${user}` : '';
  // filter for category
  let recipeCateSql = '';
  parseInt(recipeCate) ? (recipeCateSql = `AND recipe.category = ${recipeCate}`) : '';
  let productCateSql = '';
  parseInt(productCate) ? (productCateSql = `AND recipe.product_category = ${productCate}`) : '';

  let total = null;
  if (recipeId.length !== 0) {
    total = await pool.query(
      `SELECT COUNT(*) AS total FROM recipe 
      WHERE valid = 1 ${userSearch} ${recipeCateSql} ${productCateSql} AND recipe.name LIKE ? AND recipe.id IN (?)`,
      [`%${name}%`, recipeId]
    );
  } else {
    total = await pool.query(
      `SELECT COUNT(*) AS total FROM recipe 
      WHERE valid = 1 ${userSearch} ${recipeCateSql} ${productCateSql} AND recipe.name LIKE ?`,
      [`%${name}%`]
    );
  }
  return total[0][0].total;
}

async function getRecipeList(sort, user, name, perPage, offset, recipeId, recipeCate, productCate, randomRecipe = '') {
  // Sort
  let sortSql = null;
  switch (sort) {
    case '1':
      sortSql = 'ORDER BY create_time DESC';
      break;
    case '2':
      sortSql = 'ORDER BY likes DESC';
      break;
    default:
      sortSql = 'ORDER BY create_time DESC';
      break;
  }
  // Search
  let userSearch = user ? `AND recipe.user_id = ${user}` : '';

  // filter for category
  let recipeCateSql = '';
  parseInt(recipeCate) ? (recipeCateSql = `AND recipe.category = ${recipeCate}`) : '';
  let productCateSql = '';
  parseInt(productCate) ? (productCateSql = `AND recipe.product_category = ${productCate}`) : '';

  // random recipe
  let randomSql = randomRecipe ? `AND recipe.id in (${randomRecipe})` : '';

  let data = null;
  if (recipeId.length !== 0) {
    data = await pool.query(
      `SELECT recipe.*, recipe_category.name AS recipe_category_name, product_category.name AS product_category_name, COUNT(DISTINCT recipe_comment.id) AS comments, COUNT(DISTINCT recipe_like.id) AS likes, users.name AS user_name
      FROM recipe 
      JOIN recipe_category ON recipe.category = recipe_category.id 
      JOIN product_category ON recipe.product_category = product_category.id
      LEFT JOIN recipe_comment ON recipe.id = recipe_comment.recipe_id
      LEFT JOIN recipe_like ON recipe.id = recipe_like.recipe_id
      JOIN users ON recipe.user_id = users.id
      WHERE recipe.valid = 1 ${userSearch} ${recipeCateSql} ${productCateSql} AND recipe.name LIKE ? AND recipe.id IN (?)
      GROUP BY recipe.id
      ${sortSql} 
      LIMIT ? OFFSET ?`,
      [`%${name}%`, recipeId, perPage, offset]
    );
  } else {
    data = await pool.query(
      `SELECT recipe.*, recipe_category.name AS recipe_category_name, product_category.name AS product_category_name, COUNT(DISTINCT recipe_comment.id) AS comments, COUNT(DISTINCT recipe_like.id) AS likes, users.name AS user_name
      FROM recipe 
      JOIN recipe_category ON recipe.category = recipe_category.id 
      JOIN product_category ON recipe.product_category = product_category.id
      LEFT JOIN recipe_comment ON recipe.id = recipe_comment.recipe_id
      LEFT JOIN recipe_like ON recipe.id = recipe_like.recipe_id
      JOIN users ON recipe.user_id = users.id
      WHERE recipe.valid = 1 ${userSearch} ${recipeCateSql} ${productCateSql} ${randomSql} AND recipe.name LIKE ?
      GROUP BY recipe.id
      ${sortSql} 
      LIMIT ? OFFSET ?`,
      [`%${name}%`, perPage, offset]
    );
  }

  return data[0];
}

async function getRecipeById(id) {
  let [data] = await pool.query(
    `SELECT recipe.*, recipe_category.name AS recipe_category_name, product_category.name AS product_category_name, COUNT(DISTINCT recipe_comment.id) AS comments, COUNT(DISTINCT recipe_like.id) AS likes, users.name AS user_name, users.photo AS user_photo 
    FROM recipe 
    JOIN recipe_category ON recipe.category = recipe_category.id 
    JOIN product_category ON recipe.product_category = product_category.id
    LEFT JOIN recipe_comment ON recipe.id = recipe_comment.recipe_id
    LEFT JOIN recipe_like ON recipe.id = recipe_like.recipe_id 
    JOIN users ON recipe.user_id = users.id
    WHERE recipe.id = (?)
    GROUP BY recipe.id`,
    [id]
  );
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
  let [data] = await pool.execute('SELECT recipe_comment.*, users.photo, users.name FROM recipe_comment JOIN users ON recipe_comment.user_id = users.id WHERE recipe_id = ?', [id]);
  return data;
}

async function getMaterialList() {
  let [data] = await pool.execute('SELECT DISTINCT name FROM recipe_material');
  return data;
}

async function postCommentById(user_id, comment, id, time) {
  let result = await pool.execute('INSERT INTO recipe_comment (user_id, content, recipe_id, create_time) VALUES (?, ?, ?, ?)', [user_id, comment, id, time]);
  console.log(result);
}

async function postLikeById(user_id, id) {
  let result = await pool.execute('INSERT INTO recipe_like (user_id, recipe_id) VALUES (?, ?)', [user_id, id]);
  console.log(result);
}

async function getRecipeLikeByUser(user_id) {
  let result = await pool.execute('SELECT recipe_id FROM recipe_like WHERE user_id = ?', [user_id]);
  let data = result[0].map((d) => d.recipe_id);
  return data;
}

async function postRecipeStepById(id, data) {
  let result = await pool.query('INSERT INTO recipe_step (recipe_id, step, img, content) VALUES ?', [data]);
  console.log(result);
}

module.exports = {
  getRecipeCount,
  getRecipeList,
  getRecipeById,
  getMaterialById,
  getMaterialByName,
  getStepById,
  getRecipeCateList,
  getRecipeCommentById,
  getMaterialList,
  postCommentById,
  postLikeById,
  getRecipeLikeByUser,
  postRecipeStepById,
};
