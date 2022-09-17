const pool = require('../utils/db');

async function getOrderDelivery() {
  let [data] = await pool.execute('SELECT * FROM order_delivery');
  return data;
}

async function getOrderPayment() {
  let [data] = await pool.execute('SELECT * FROM order_payment');
  return data;
}

async function getOrders() {}

async function getOrderDetailInfo() {}

async function postOrderById(user_id, status, delivery, payment, create_time, cartTotal) {
  let orderResult = await pool.execute('INSERT INTO orders (user_id, status_id, delivery_id, payment_id, create_time, order_total) VALUES (?,?,?,?,?,?)', [
    user_id,
    status,
    delivery,
    payment,
    create_time,
    cartTotal,
  ]);
  console.log(orderResult);
  return orderResult;
}

async function postOrderDetailById(order_id, product_id, picnic_id, camping_id, quantity) {
  let result = await pool.execute('INSERT INTO order_detail (order_id, product_id, picnic_id, camping_id, quantity) VALLUES (?,?,?,?,?)', [
    order_id,
    product_id,
    picnic_id,
    camping_id,
    quantity,
  ]);
  console.log(result);
  return result;
}

module.exports = { getOrderDelivery, getOrderPayment, getOrders, getOrderDetailInfo, postOrderById, postOrderDetailById };
