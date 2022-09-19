const express = require('express');
const router = express.Router();
const campingController = require('../controllers/camping');
const authMid = require('../middlewares/auth');
const campingModel = require('../models/camping');

router.get('/', campingController.getCampingList);

router.get('/campingCollected', authMid.checkLogin, async (req, res) => {
  let getCamping = await campingModel.getCollectCamping(req.session.user.id);
  res.json(getCamping);
});

// get includes
router.get('/campingHadJoin', authMid.checkLogin, async (req, res) => {
  let getJoin = await campingModel.getJoinCamping(req.session.user.id);
  res.json(getJoin);
});

// add collect
router.post('/campingCollect/:campingId', authMid.checkLogin, campingController.postCampingCollect);

// delete collect
router.delete('/campingCollect/:campingId', authMid.checkLogin, campingController.postDeleteCollect);

// user collect
router.get('/userCollect', authMid.checkLogin, campingController.userCollects);
// user join history
router.get('/userJoin', authMid.checkLogin, campingController.joinHistory);

// add join  --> /api/1.0/camping/campingJoin/1
router.post('/campingJoin/:campingId', authMid.checkLogin, campingController.postCampingJoin);

router.delete('/campingJoin/:campingId', authMid.checkLogin, campingController.postDeleteJoin);
router.get('/getUserJoin/:campingId', authMid.checkLogin, campingController.joinuser);
router.get('/:campingId', campingController.getCampingDetail);

module.exports = router;
