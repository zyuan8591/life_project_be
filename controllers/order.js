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

async function getOrderStatusList(req, res) {
  let data = await orderModel.getOrderStatus();
  res.json(data);
}

async function getOrderList(req, res) {
  let { page, perPage, status } = req.query;

  // console.log(status);

  let user = req.session.user.id;
  // console.log(user);

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await orderModel.getOrderCount(user, parseInt(status));
  // console.log(total);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  let data = await orderModel.getOrders(parseInt(status), user, perPage, offset);

  console.log(total, perPage, page, lastPage, data);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
  });
}

async function getOrderDetail(req, res) {
  let id = req.params.id;
  // let user = req.query.user;
  let user = req.session.user.id;
  // console.log(id, user);

  let orderData = await orderModel.getOrders('', user, '', '', id);
  // console.log('orderdata', orderData);

  let [orderInfo] = orderData.map((v, i) => {
    return {
      id: v.id,
      totalPrice: v.order_total,
      time: v.create_time,
      name: v.recipient_name,
      phone: v.recipient_phone,
      address: v.recipient_address,
      email: v.recipient_email,
      memo: v.memo,
    };
  });

  // console.log(orderInfo);

  let data = [{ ...orderInfo, product: [], picnic: [], camping: [] }];

  let cartData = await orderModel.getOrderById();
  // console.log('cart0', cartData[0]);
  cartData[0]
    .filter((v, i) => {
      return v.order_id == id;
    })

    .map((d, i) => {
      console.log(d);
      data[0].product.push({
        id: d.product_id,
        name: d.product_name,
        quantity: d.quantity,
        price: d.product_price,
        img: d.product_img,
        ischecked: true,
        itemTotal: d.quantity * d.product_price,
      });
      data[0].picnic.push({
        id: d.picnic_id,
        name: d.picnic_title,
        img: d.picnic_img,
        price: d.picnic_price,
        quantity: d.quantity,
        ischecked: true,
        itemTotal: d.quantity * d.picnic_price,
      });
      data[0].camping.push({
        id: d.camping_id,
        name: d.camping_title,
        img: d.camping_img,
        price: d.camping_price,
        quantity: d.quantity,
        ischecked: true,
        itemTotal: d.quantity * d.camping_price,
      });
    });

  console.log('data', data);
  res.json({ data });
}

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
  console.log('insertOrders', insertOrders);

  let order_id = insertOrders[0].insertId;
  // console.log('orderId', order_id);

  // 綠界
  // let MerchantId = 3002607;
  // let HashKey = 'pwFHCqoQZGmho4w6';
  // let HashIV = 'EkRm7iFT261dpevs';
  // let EncryptTypt = 1;
  // let MerchantTradeNo = order_id;
  // let MerchantTradeDate = create_time;
  // let PaymentType = 'aio';
  // let TotalAmount = 100;
  // let TradeDesc = 'nice';
  // let ItemName = 'fuck';
  // let ReturnURL = ' http://localhost:3001/orders/order';
  // let ChoosePayment = 'ALL';

  // if (payment === 3) {
  //   await axios.post('https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', values);
  // }
  // return;

  // checkmacvalue

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
  // console.log('orderDetailResult', orderDetailResult);

  // if (req.body.payment === 3) {
  //   axios;
  // }
  // console.log(address);

  res.json({ order_id });
}

module.exports = { getOrderDeliveryList, getOrderPaymentList, getOrderStatusList, getOrderList, getOrderDetail, postOrder };
