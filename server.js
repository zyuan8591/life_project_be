require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 3001;
const path = require('path');
// 啟用session
const expressSession = require('express-session');
// 把 session 存在硬碟中
var FileStore = require('session-file-store')(expressSession);
app.use(
  expressSession({
    store: new FileStore({
      // session 儲存的路徑
      path: path.join(__dirname, '..', 'sessions'),
    }),
    secret: process.env.SESSION_SECRET,
    // 如果 session 沒有改變的話，要不要重新儲存一次？
    resave: false,
    // 還沒初始化的，要不要存
    saveUninitialized: false,
  })
);

// Routers
const recipe = require('./routers/recipe');
const news = require('./routers/news');
const signup = require('./routers/signup');
const camping = require('./routers/camping');
const map = require('./routers/map');
const login = require('./routers/login');
const user = require('./routers/user');
const userUpdata = require('./routers/userUpdata');

const corsOptions = {
  // 如果要讓 cookie 可以跨網域存取，這邊要設定 credentials
  // 且 origin 也要設定
  credentials: true,
  origin: ['http://localhost:3000'],
};
app.use(cors(corsOptions));
app.use(express.json());
//設置靜態檔案
app.use(express.static(path.join(__dirname, 'public')));
// middleware
app.use('/api/1.0/recipes', recipe);
app.use('/api/1.0/news', news);
app.use('/api/1.0/signup', signup);
app.use('/api/1.0/camping', camping);
app.use('/api/1.0/map', map);
app.use('/api/1.0/', login);
app.use('/api/1.0/user', user);
app.use('/api/1.0/userUpdata', userUpdata);

// server running
app.listen(port, () => console.log('server is runing : ' + port));
