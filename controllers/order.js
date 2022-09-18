const orderModel = require('../models/order');
const moment = require('moment');
const { axios } = require('axios');

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
  // console.log('body:', req.body);

  // insert into orders
  let { delivery, payment, productTotal, picnicTotal, campingTotal, name, phone, email, memo, cityName, areaName, address } = req.body;

  let fullAddress = cityName + areaName + address;
  let cartTotal = productTotal + picnicTotal + campingTotal;
  let create_time = moment().format('YYYY-MM-DD h:mm:ss');
  let status = 3;
  // TODO: point
  let point_discount = 10;

  // console.log(req.session);
  if (req.session.user === null) return;

  let user_id = req.session.user.id;
  // console.log('id', user_id);

  let orderData = [user_id, status, delivery, payment, cartTotal, create_time, name, phone, fullAddress, email, memo, point_discount];

  let insertOrders = await orderModel.postOrderById(orderData);
  // console.log('insertOrders', insertOrders);

  let order_id = insertOrders[0].insertId;
  // console.log('orderId', order_id);

  // insert into order_detail
  //            [[1, 87, 0, 0, 2], [], ...]
  // let data = [order_id, product_id, picnic_id, cammping_id, quantity];

  let { productItems, picnicItems, campingItems } = req.body;
  // console.log(prouductItems, picnicItems, campingItems);
  let productCartItem = productItems
    .filter((v) => v.ischecked === true)
    .map((d) => {
      return [order_id, d.id, 0, 0, d.quantity];
    });
  // console.log(productCartItem);

  let campingCartItem = campingItems
    .filter((v) => v.ischecked === true)
    .map((d) => {
      return [order_id, 0, d.id, 0, d.quantity];
    });
  // console.log(campingCartItem);

  let picnicCartItem = picnicItems
    .filter((v) => v.ischecked === true)
    .map((d) => {
      return [order_id, 0, 0, d.id, d.quantity];
    });
  // console.log(picnicCartItem);

  let cartItem = [...productCartItem, ...campingCartItem, ...picnicCartItem];
  // console.log(cartItem);

  let orderDetailResult = await orderModel.postOrderDetailById(cartItem);
  console.log('orderDetailResult', orderDetailResult);

  // if (req.body.payment === 3) {
  //   axios;
  // }
  // console.log(address);
  res.json({ message: 'ok' });
}

module.exports = { getOrderDeliveryList, getOrderPaymentList, getOrderList, getOrderDetail, postOrder };
