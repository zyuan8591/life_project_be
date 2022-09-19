const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// GET /products
router.get('/', productController.getProductList);

// GET /products/category
router.get('/category', productController.getProductCategory);

// GET /products/brand
router.get('/brand', productController.getBrandList);

// get product for id
// GET /products/1
router.get('/:id', productController.getProductDetail);

// GET /product/detailImg
router.get('/:id/detailImg', productController.getProductDetailImg);

module.exports = router;
