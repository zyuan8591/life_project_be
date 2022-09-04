require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 3001;

// Routers
const recipe = require('./routers/recipe');
const news = require('./routers/news');
const signup = require('./routers/signup');

app.use(cors());
app.use(express.json());

// middleware
app.use('/api/1.0/recipes', recipe);
app.use('/api/1.0/news', news);
app.use('/api/1.0/signup', signup);

// server running
app.listen(port, () => console.log('server is runing'));
