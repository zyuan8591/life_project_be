let checkLogin = function (req, res, next) {
  // 判斷這個人是否已經登入？
  // session 裡如果沒有 member 這個資料，表示沒有登入過
  console.log(req.session.user);
  if (!req.session.user) {
    //尚未登入
    return res.status(403).json({ msg: '尚未登入' });
  }
  next();
};

module.exports = { checkLogin };
