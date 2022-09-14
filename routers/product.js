const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// GET /products
router.get('/', productController.getProductList);

// GET /products/category
router.get('/category', productController.getProductCategory);

// get product for id
// GET /products/1
// router.get('/:id');

module.exports = router;
