const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map');

router.get('/', mapController.getMapList);

module.exports = router;
