require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 3001;

// Routers
const recipe = require('./routers/recipe');
const news = require('./routers/news');

app.use(cors());
app.use(express.json());

// middleware
app.use('/api/1.0/recipes', recipe);
app.use('/api/1.0/news', news);

// server running
app.listen(port, () => console.log('server is runing'));
