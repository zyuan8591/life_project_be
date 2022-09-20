const recipeModel = require('../models/recipe');
const moment = require('moment');

async function getRecipeList(req, res) {
  let { sort, user, name = '', page, perPage, materialName = '', recipeCate, productCate, random, userLike } = req.query;

  // get recipe_id by material name [ 5, 9, 13 ]
  let searchMaterial = [];
  if (materialName) {
    searchMaterial = await recipeModel.getMaterialByName(materialName);
  }

  // get recipe_id by user like
  let searchLike = [];
  if (req.session.user && userLike === 'true') {
    searchLike = await recipeModel.getRecipeLikeByUser(req.session.user.id);
    console.log(req.session.user.id);
    console.log('searchlike', searchLike);
  }
  // concat search material and user like list
  let recipeId = searchMaterial.concat(searchLike);

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await recipeModel.getRecipeCount(user, name, recipeId, recipeCate, productCate);
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

  let data = await recipeModel.getRecipeList(sort, user, name, perPage, offset, recipeId, recipeCate, productCate, randomRecipe);

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
  let user_id = req.session.user.id;
  let { comment } = req.body;
  let time = moment().format('YYYY-MM-DD h:mm:ss');
  recipeModel.postCommentById(user_id, comment, id, time);
  res.json({ message: 'ok' });
}

async function postRecipeLike(req, res) {
  let id = parseInt(req.params.id);
  let user_id = req.session.user.id;
  let likeList = await recipeModel.getRecipeLikeByUser(user_id);
  if (likeList.includes(id)) return res.json({ message: '此食譜已收藏' });
  await recipeModel.postLikeById(user_id, id);
  res.json({ message: 'ok' });
}

// POST RECIPE !!!!
async function postRecipe(req, res) {
  // console.log('postRecipe', req.body);
  let { name, content, category, product_category } = req.body;
  let user_id = req.session.user.id;
  let time = moment().format('YYYY-MM-DD h:mm:ss');
  let data = [name, content, category, product_category, `/recipe/recipe_img/${req.file.filename}`, user_id, time];
  let insertId = await recipeModel.postRecipe(data);
  console.log(insertId);
  res.json({ message: 'ok', id: insertId });
}

async function postRecipeStep(req, res) {
  let id = parseInt(req.params.id);
  let step = req.body.step.split(',');
  let content = req.body.content.split(',');
  let files = req.files;
  let data = [];
  for (let i = 0; i < step.length; i++) {
    if (!step[i] || !content[i] || !files[i]) break;
    data.push([]);
    data[i].push(id, parseInt(step[i]), `/recipe/recipe_step/${files[i].originalname}`, content[i]);
  }
  console.log(data);
  if (data.length === 0) return res.json({ message: '資料為空' });
  await recipeModel.postRecipeStepById(data);
  res.json({ message: 'ok' });
}

async function postRecipeMaterial(req, res) {
  let id = parseInt(req.params.id);
  let insertData = req.body.material.map((d) => {
    if (!d.name || !d.quantity) return;
    let dataObj = { ...d, id: id };
    return Object.values(dataObj);
  });
  // delete empty item
  insertData = insertData.filter((d) => !!d);
  if (insertData.length === 0) return res.json({ message: '資料為空' });
  await recipeModel.postRecipeMaterialById(insertData);
  res.json({ message: 'ok' });
}

async function getUserRecipeLike(req, res) {
  let user_id = req.session.user.id;
  let data = await recipeModel.getRecipeLikeByUser(user_id);
  res.json({ message: 'ok', data });
}

async function delUserRecipeLike(req, res) {
  let user_id = req.session.user.id;
  let recipe_id = req.params.id;
  await recipeModel.delRecipeLike(user_id, recipe_id);
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
  postRecipeStep,
  postRecipeMaterial,
  postRecipe,
  getUserRecipeLike,
  delUserRecipeLike,
};
