const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

// GET orders /api/1.0/orders?sort=1&status=1&user=1&page=1&perPage=5
router.get('/', orderController.getOrderList);

// GET order_delivery
router.get('/delivery', orderController.getOrderDeliveryList);

// GET order_payment
router.get('/payment', orderController.getOrderPaymentList);

router.get('/status', orderController.getOrderStatusList);

// POST order /api/1.0/orders/order
router.post('/order', orderController.postOrder);

// GET detail /api/1.0/orders/5
router.get('/:id', orderController.getOrderDetail);

module.exports = router;
