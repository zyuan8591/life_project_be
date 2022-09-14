const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe');
const authMiddleware = require('../middlewares/auth');

// GET recipe /api/1.0/recipes?sort=1&user=1&name='咖啡'&page=2&perPage=7
router.get('/', recipeController.getRecipeList);

// GET /api/1.0/recipes/category
router.get('/category', recipeController.getRecipeCate);

// GET /api/1.0/recipes/material
router.get('/material', recipeController.getMaterialList);

// GET detail /api/1.0/recipes/5
router.get('/:id', recipeController.getRecipeDetail);

// GET material /api/1.0/recipes/5/material
router.get('/:id/material', recipeController.getMaterialById);

// GET step /api/1.0/recipes/5/step
router.get('/:id/step', recipeController.getStepById);

// GET comment /api/1.0/recipes/5/comments
router.get('/:id/comment', recipeController.getRecipeComment);

// POST comment /api/1.0/recipes/5/comment
router.post('/:id/comment', authMiddleware.checkLogin, recipeController.postRecipeComment);

// POST comment /api/1.0/recipes/5/like
router.post('/:id/like', authMiddleware.checkLogin, recipeController.postRecipeLike);

// POST comment /api/1.0/recipes/5/step
// router.post('/:id/step', authMiddleware.checkLogin, recipeController.postRecipeStep);
router.post('/:id/step', recipeController.postRecipeStep);

module.exports = router;
