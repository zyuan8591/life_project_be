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

async function getOrderList(req, res) {
  let { page, perPage, status } = req.query;

  let user = req.session.user.id;

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await orderModel.getOrderCount(user, status);
  // console.log(total);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  let data = await orderModel.getOrders(status, user, perPage, offset);

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

  let orderData = await orderModel.getOrders('', user, '', '', id);
  // console.log(orderData[0]);
  let orderInfo = orderData[0].map((v, i) => {
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

  let data = [{ ...orderInfo[0], product: [], picnic: [], camping: [] }];

  let cartData = await orderModel.getOrderById();
  // console.log(cartData[0]);
  cartData[0]
    .filter((v, i) => {
      return v.order_id == id;
    })
    .map((d, i) => {
      // console.log(d);
      data[0].product.push({ id: d.product_id, name: d.product_name, quantity: d.quantity, price: d.product_price, img: d.product_img });
      data[0].picnic.push({ id: d.picnic_id, title: d.picnic_title, img: d.picnic_img, price: d.picnic_price, quantity: d.quantity });
      data[0].camping.push({ id: d.camping_id, title: d.camping_title, img: d.camping_img, price: d.camping_price, quantity: d.quantity });
    });

  console.log('data', data);
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

  // 綠界
  // let values = 123;

  // if (payment === 3) {
  //   await axios.post('https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', values);
  // }
  // return;

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
  console.log(productCartItem);

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

  // product

  let productId = productCartItem.map((v) => {
    return v[1];
  });
  productId.sort((a, b) => {
    return a - b;
  });
  let productSales = productCartItem.map((v) => {
    return v[4];
  });
  let productResult = await orderModel.getProductSales(productId);
  // let { inventory, sales } = productResult[0];
  // console.log(productResult[0]);
  let productArr = productResult[0];
  let inventory = productArr.map((v) => {
    return v.inventory;
  });
  let sales = productArr.map((v) => {
    return v.sales;
  });
  console.log('id', productId, 'sales', productSales);
  console.log('inventory', inventory, 'sales', sales);
  for (let i = 0; i < productId.length; i++) {
    // let inventory = productResult[i].inventory;
    // let sales = productResult[i].sales;
    let inventoryResult = inventory[i] - productSales[i];
    let salesResult = sales[i] + productSales[i];

    console.log('id', productId[i]);
    console.log('inventoryResult', inventoryResult);
    console.log('salesResult', salesResult);

    let updateProductResult = await orderModel.updateProductSales(inventoryResult, salesResult, productId[i]);
  }
  res.json({ order_id });
}

module.exports = { getOrderDeliveryList, getOrderPaymentList, getOrderList, getOrderDetail, postOrder };
