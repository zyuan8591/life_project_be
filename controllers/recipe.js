const recipeModel = require('../models/recipe');

async function getRecipeList(req, res) {
  let { sort, user, name = '', page, perPage } = req.query;

  // TODO: search material

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await recipeModel.getAllRecipeCount();
  total = total[0].total;
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  // TODO: product_category
  // TODO: recipe_category
  let data = await recipeModel.getRecipeList(sort, user, name, perPage, offset);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
  });
}

async function getRecipeDetail(req, res) {
  // TODO: JOIN category
  let id = req.params.id;
  let data = await recipeModel.getRecipeById(id);
  res.json(data);
}

async function getMaterialById(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getMaterialById(id);
  res.json(data);
}

async function getStepById(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getStepById(id);
  res.json(data);
}

async function getRecipeCate(req, res) {
  console.log('hi');
  let data = await recipeModel.getRecipeCateList();
  res.json(data);
}

module.exports = { getRecipeList, getRecipeDetail, getMaterialById, getStepById, getRecipeCate };
