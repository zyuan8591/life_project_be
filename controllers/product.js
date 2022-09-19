const productModel = require('../models/product');
const moment = require('moment');

async function getIndexProduct(req, res) {
  let id = [1, 33, 35, 44, 46, 71, 87, 94, 104, 113, 118, 128, 212];
  let result = await productModel.getProductById(id);
  res.json(result);
}

async function getProductList(req, res) {
  let { productName, productCate, page, perPage, brand, smallThan, biggerThan, sort } = req.query;
  // console.log(req.query);
  // console.log(productCate);
  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await productModel.getProductCount(productName, productCate, brand, smallThan, biggerThan, sort);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);
  // console.log('total', total, 'lastpage', lastPage, 'offset', offset, 'perPage', perPage);
  let data = await productModel.getProductList(productName, productCate, perPage, offset, brand, smallThan, biggerThan, sort);
  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
      offset,
    },
    data,
  });
}

async function getProductCategory(req, res) {
  let data = await productModel.getProductCategory();
  res.json(data);
}

async function getProductDetail(req, res) {
  let id = req.params.id;
  let data = await productModel.getProductById(id);
  res.json(data);
}

async function getBrandList(req, res) {
  let { brand } = req.query;
  let data = await productModel.getBrandList(brand);
  res.json(data);
}
async function getProductDetailImg(req, res) {
  let id = req.params.id;
  let data = await productModel.getProductDetailImg(id);
  res.json(data);
}

async function getProductComment(req, res) {
  let id = req.params.id;
  let data = await productModel.getProductComment(id);
  res.json(data);
}

async function writeProductComment(req, res) {
  let id = req.params.id;
  let user_id = req.session.user.id;
  let { writeComment, star } = req.body;
  let time = moment().format();
  productModel.writeProductComment(user_id, writeComment, id, time, star);
  res.json({ message: 'ok' });
}

async function addProductLike(req, res) {
  let { id } = req.body;
  let user_id = req.session.user.id;
  productModel.addProductLike(user_id, id);
  res.json({ message: 'ok' });
  console.log('addLike', id, user_id);
}

async function getProductLike(req, res) {
  let user_id = req.session.user.id;
  let data = await productModel.getProductLike(user_id);
  res.json(data);
  console.log('getLike', user_id);
}

async function removeProductLike(req, res) {
  let { id } = req.params;
  let user_id = req.session.user.id;
  productModel.removeProductLike(user_id, id);
  res.json({ message: 'ok' });
  console.log('remove', id, user_id);
}

async function getRandomProductRecommend(req, res) {
  let { category } = req.query;
  let total = await productModel.getProductCount(category);
  let randomProduct = [];
  for (let i = 0; i < 9; i++) {
    let id = Math.floor(Math.random() * total) + 1;
    if (!randomProduct.includes(id)) randomProduct.push(id);
  }
  randomProduct = randomProduct.join(',');
  console.log(randomProduct);
  let data = await productModel.getRandomProductRecommend(category, randomProduct);
  res.json(data);
}
module.exports = {
  getIndexProduct,
  getProductList,
  getProductCategory,
  getProductDetail,
  getBrandList,
  getProductDetailImg,
  getProductComment,
  writeProductComment,
  addProductLike,
  getProductLike,
  removeProductLike,
  getRandomProductRecommend,
};
