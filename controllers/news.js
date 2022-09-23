const newsModel = require('../models/news');

async function getNewsList(req, res) {
  let cate = req.query.cate;
  // console.log(cate);
  let data = await newsModel.getAllNews(cate);
  res.json(data);
}

async function getNewsCategory(req, res) {
  let data = await newsModel.getAllCategory();
  res.json(data);
}

module.exports = { getNewsList, getNewsCategory };
