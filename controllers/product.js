const productModel = require('../models/product');

async function getProductList(req, res) {
  //   let id = req.params.id;
  let data = await productModel.getProductList();
  res.json(data);
}
module.exports = { getProductList };
