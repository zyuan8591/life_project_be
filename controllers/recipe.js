const recipeModel = require('../models/recipe');

async function getRecipeList(req, res) {
  let { sort, user, name = '', page, perPage, materialName = '', recipeCate, productCate } = req.query;

  console.log(req.query);

  // get recipe_id by material name [ 5, 9, 13 ]
  let searchMaterial = [];
  if (materialName) {
    searchMaterial = await recipeModel.getMaterialByName(materialName);
  }

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await recipeModel.getRecipeCount(user, name, searchMaterial, recipeCate, productCate);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  let data = await recipeModel.getRecipeList(sort, user, name, perPage, offset, searchMaterial, recipeCate, productCate);

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
  let data = await recipeModel.getRecipeCateList();
  res.json(data);
}

async function getRecipeComment(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getRecipeCommentById(id);
  res.json(data);
}

async function getMaterialList(req, res) {
  let data = await recipeModel.getMaterialList();
  let materialArr = data.map((d) => {
    return d.name;
  });
  res.json(materialArr);
}

module.exports = {
  getRecipeList,
  getRecipeDetail,
  getMaterialById,
  getStepById,
  getRecipeCate,
  getRecipeComment,
  getMaterialList,
};
