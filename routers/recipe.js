const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
// const moment = require('moment');
// ===========================================================================
// get recipes
// GET /api/1.0/recipes?sort=1&user=1&name='咖啡'&page=2&perPage=7
router.get('/', async function (req, res) {
  let { sort, user, name = '', page, perPage } = req.query;

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

  // TODO: search material
  // Search
  let userSearch = user ? `AND recipe.user_id = ${user}` : '';
  // let nameSearch = name ? `AND  recipe.name LIKE '%${name}%'` : '';

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let [total] = await pool.execute('SELECT COUNT(*) AS total FROM recipe WHERE valid = 1');
  total = total[0].total;
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  // TODO: product_category
  // TODO: recipe_category

  let [data] = await pool.query(
    `SELECT recipe.*, recipe_category.name AS recipe_category_name FROM recipe JOIN recipe_category ON recipe.category = recipe_category.id WHERE valid = 1 ${userSearch} AND recipe.name LIKE ? ${sortSql} LIMIT ? OFFSET ?`,
    [`%${name}%`, perPage, offset]
  );
  res.json(data);
});

// ===========================================================================
// GET specify recipe
router.get('/:id', async function (req, res) {
  // TODO: JOIN category
  let id = req.params.id;
  let [data] = await pool.query('SELECT * FROM recipe WHERE id = ?', [id]);
  res.json(data);
});
// ===========================================================================
// GET specify recipe material
router.get('/:id/material', async function (req, res) {
  let id = req.params.id;
  let [data] = await pool.query('SELECT * FROM recipe_material WHERE id = ?', [id]);
  res.json(data);
});
// ===========================================================================
// GET specify recipe step
router.get('/:id/step', async function (req, res) {
  let id = req.params.id;
  let [data] = await pool.query('SELECT * FROM recipe_step WHERE recipe_id = ?', [id]);
  res.json(data);
});

module.exports = router;
