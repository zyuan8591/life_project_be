const recipeModel = require('../models/recipe');
const moment = require('moment');

async function getRecipeList(req, res) {
  let { sort, user, name = '', page, perPage, materialName = '', recipeCate, productCate, random } = req.query;

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

  // random recipe
  if (random) perPage = parseInt(random);
  let randomRecipe = [];
  for (let i = 0; i < random; i++) {
    while (randomRecipe.length < i + 1) {
      let id = Math.floor(Math.random() * total) + 1;
      if (!randomRecipe.includes(id)) randomRecipe.push(id);
    }
  }
  randomRecipe = randomRecipe.join(',');

  let data = await recipeModel.getRecipeList(sort, user, name, perPage, offset, searchMaterial, recipeCate, productCate, randomRecipe);

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

async function postRecipeComment(req, res) {
  let id = req.params.id;
  let { user_id, comment } = req.body;
  let time = moment().format('YYYY-MM-DD h:mm:ss');
  recipeModel.postCommentById(user_id, comment, id, time);
  res.json({ message: 'ok' });
}

async function postRecipeLike(req, res) {
  let id = parseInt(req.params.id);
  let { user_id } = req.body;
  let likeList = await recipeModel.getRecipeLikeByUser(user_id);
  if (likeList.includes(id)) return res.json({ message: '此食譜已收藏' });
  recipeModel.postLikeById(user_id, id);
  res.json({ message: 'ok' });
}

module.exports = {
  getRecipeList,
  getRecipeDetail,
  getMaterialById,
  getStepById,
  getRecipeCate,
  getRecipeComment,
  getMaterialList,
  postRecipeComment,
  postRecipeLike,
};
