const newsModel = require('../models/news');

async function getNewsList(req, res) {
  let data = await newsModel.getAllNews();
  res.json(data);
}

module.exports = { getNewsList };
