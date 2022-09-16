const productModel = require('../models/product');

async function getProductList(req, res) {
  let { productName, productCate, page, perPage, brand } = req.query;
  console.log(req.query);
  // console.log(productCate);
  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await productModel.getProductCount(productCate, page);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);
  // console.log('total', total, 'lastpage', lastPage, 'offset', offset, 'perPage', perPage);
  let data = await productModel.getProductList(productName, productCate, perPage, offset, brand);
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

module.exports = { getProductList, getProductCategory, getProductDetail, getBrandList, getProductDetailImg };
