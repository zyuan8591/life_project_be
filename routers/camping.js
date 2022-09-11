const express = require('express');
const router = express.Router();
const campingController = require('../controllers/camping');

router.get('/', campingController.getCampingList);

router.get('/:campingId', campingController.getCampingDetail);

module.exports = router;
