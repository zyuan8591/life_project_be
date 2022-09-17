const orderModel = require('../models/order');
const moment = require('moment');
const { default: axios } = require('axios');

async function getOrderDeliveryList(req, res) {
  let data = await orderModel.getOrderDelivery();
  res.json(data);
}

async function getOrderPaymentList(req, res) {
  let data = await orderModel.getOrderPayment();
  res.json(data);
}

async function getOrderList(req, res) {}

async function getOrderDetail(req, res) {}

async function postOrder(req, res) {
  console.log(req.body);

  // insert into orders
  let { delivery, payment, productTotal, picnicTotal, campingTotal } = req.body;
  let cartTotal = productTotal + picnicTotal + campingTotal;
  let create_time = moment().format('YYYY-MM-DD h:mm:ss');
  let status = 3;

  // console.log(req.session);
  let user_id = req.session.user.id;
  // console.log('id', user_id);
  // if (!user_id) return;

  let orderResult = await orderModel.postOrderById(user_id, status, delivery, payment, create_time, cartTotal);
  // console.log(orderResult);

  // insert into detail
  let order_id = orderResult[0].insertId;
  // console.log('orderId', order_id);

  let { prouductItems, picnicItems, campingItems } = req.body;
  console.log(prouductItems, picnicItems, campingItems);

  // orderModel.postOrderDetailById(order_id, productId, picnicId, campingId, quantity);

  // insert into detail recipient
  let { name, phone, email, memo, cityName, areaName, address } = req.body;
  let fullAddress = cityName + areaName + address;

  // if (req.body.payment === 3) {
  //   axios;
  // }
  // console.log(address);
  res.json({ message: 'ok' });
}

module.exports = { getOrderDeliveryList, getOrderPaymentList, getOrderList, getOrderDetail, postOrder };
