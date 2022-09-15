const productModel = require('../models/product');

async function getProductList(req, res) {
  // let { productId, productCate } = req.query;
  // console.log(req.query);
  // let total = await productModel.getProductCount();
  let data = await productModel.getProductList();
  res.json(data);
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
  let data = await productModel.getBrandList();
  res.json(data);
}
async function getProductDetailImg(req, res) {
  let id = req.params.id;
  let data = await productModel.getProductDetailImg(id);
  res.json(data);
}

module.exports = { getProductList, getProductCategory, getProductDetail, getBrandList, getProductDetailImg };
