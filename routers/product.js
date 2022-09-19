const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const authMiddleware = require('../middlewares/auth');

// GET /products/index
router.get('/index', productController.getIndexProduct);

// GET /products
router.get('/', productController.getProductList);

// GET /products/category
router.get('/category', productController.getProductCategory);

// GET /products/brand
router.get('/brand', productController.getBrandList);

// get product for id
// GET /products/1
router.get('/:id', productController.getProductDetail);

// GET /products/1/detailImg
router.get('/:id/detailImg', productController.getProductDetailImg);

// GET /products/1/comment
router.get('/:id/productComment', productController.getProductComment);

// GET /products/like
router.get('/:user_id/like', authMiddleware.checkLogin, productController.getProductLike);

// POST /products/1/comment
router.post('/:id/comment', authMiddleware.checkLogin, productController.writeProductComment);

router.post('/addLike', authMiddleware.checkLogin, productController.addProductLike);

module.exports = router;
