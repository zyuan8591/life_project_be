const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe');
// const moment = require('moment');

// GET recipe /api/1.0/recipes?sort=1&user=1&name='咖啡'&page=2&perPage=7
router.get('/', recipeController.getRecipeList);

// GET /api/1.0/recipes/category
router.get('/category', recipeController.getRecipeCate);

// GET detail /api/1.0/recipes/5
router.get('/:id', recipeController.getRecipeDetail);

// GET material /api/1.0/recipes/5/material
router.get('/:id/material', recipeController.getMaterialById);

// GET step /api/1.0/recipes/5/step
router.get('/:id/step', recipeController.getStepById);

module.exports = router;
