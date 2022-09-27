const productModel = require('../models/product');
const moment = require('moment');
const pool = require('../utils/db');

async function getIndexProduct(req, res) {
  let id = [28, 24, 26, 32, 39, 69, 57, 80, 75, 117, 140, 123];
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
  console.log(total);
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
  // let id1 = req.query
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

  let randomNumberData = await productModel.getRandomProductNumber(category);
  let randomNumber = [];
  randomNumberData.map((v) => {
    randomNumber.push(v.id);
  });

  let randomProduct = [];
  let randomProductNumber = [];
  for (let i = 0; i < 12; i++) {
    while (randomProduct.length < i + 1) {
      let choose = Math.floor(Math.random() * randomNumber.length);
      if (!randomProduct.includes(choose)) randomProduct.push(choose);
      if (!randomProductNumber.includes(randomNumber[choose])) randomProductNumber.push(randomNumber[choose]);
    }
  }
  randomProduct = randomProduct.join(',');
  console.log(randomProductNumber);
  let data = await productModel.getRandomProductRecommend(randomProductNumber);
  res.json(data);
}

async function addProduct(req, res) {
  // let company_id = req.session.user.id;
  let { name, price, brand, inventory, cate, spec, color, intro } = req.body;
  // console.log(req.files[1].originalname);
  let photo1 = req.files[0].originalname;
  let photo2 = req.files[1].originalname;
  let photo3 = req.files[2].originalname;
  let detail_img = req.files[3].originalname;

  // console.log(photo1, photo2, photo3);
  let now = moment().format();
  // console.log(req.body, now);
  productModel.addProduct(name, price, brand, inventory, cate, spec, color, intro, photo1, photo2, photo3, now, detail_img);

  res.json({ message: '新增成功' });
}

async function getProductRank(req, res) {
  let data = await productModel.getProductRank();
  res.json(data);
}
async function getUserProductLike(req, res) {
  let user_id = req.session.user.id;
  const perPage = 5;
  const page = req.query.page || 1;
  let [total] = await pool.execute('SELECT COUNT(*) AS total FROM product_like JOIN product ON product_like.product_id = product.id WHERE user_id = ?', [user_id]);
  total = total[0].total;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  let data = await productModel.getProductLike(user_id);
  data = data.slice(offset, offset + perPage);
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

async function productUpdate(req, res) {
  console.log('req.files', req.files);
  console.log('req.body', req.body);
  let { id, detailId, name, price, inventory, cate, spec, color, intro } = req.body;
  // console.log(req.files[1].originalname);
  // let photo1 = req.files[0].originalname;
  // let photo2 = req.files[1].originalname;
  // let photo3 = req.files[2].originalname;
  // let detail_img = req.files[3].originalname;
  console.log('detailId', detailId);
  let { photoChange1, photoChange2, photoChange3, photoChange4 } = req.body;
  let change = [photoChange1, photoChange2, photoChange3, photoChange4]
    .map((d, i) => {
      if (d === 'false') return i + 1;
    })
    .filter((d) => d);

  let img = [req.body.photoOrgin1, req.body.photoOrgin2, req.body.photoOrgin3, req.body.photoOrgin4];
  for (let i = 0; i < req.files.length; i++) {
    img[change[i] - 1] = req.files[i].originalname;
  }
  productModel.productUpdate(id, detailId, name, price, inventory, cate, spec, color, intro, img);
  console.log('img', img);
  res.json({ message: '修改成功' });
}

async function productDelete(req, res) {
  let { id } = req.query;
  console.log(id);
  productModel.productDelete(id);
  res.json({ message: '刪除成功' });
}

async function productDiscount(req, res) {
  let data = await productModel.productDiscount();
  res.json(data);
}

async function addDiscount(req, res) {
  console.log('req.files', req.files);
  console.log('req.body', req.body);
  let { name, discount, start_time, end_time, company } = req.body;

  console.log(name, discount, start_time, end_time, company);
  productModel.addDiscount(name, discount, start_time, end_time, company);

  res.json({ message: '新增成功' });
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
  addProduct,
  getProductRank,
  productUpdate,
  productDelete,
  getUserProductLike,
  productDiscount,
  addDiscount,
};
