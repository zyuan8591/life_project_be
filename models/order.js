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
  let result = await pool.execute('INSERT INTO orders (user_id, status_id, delivery_id, payment_id, create_time, order_total) VALUES (?,?,?,?,?,?)', [
    user_id,
    status,
    delivery,
    payment,
    create_time,
    cartTotal,
  ]);
  return result;
}

async function postOrderDetailById(cartItem) {
  let result = await pool.query('INSERT INTO order_detail (order_id, product_id, camping_id, picnic_id, quantity) VALUES ?', [cartItem]);
  return result;
}

module.exports = { getOrderDelivery, getOrderPayment, getOrders, getOrderDetailInfo, postOrderById, postOrderDetailById };
