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

async function postOrderById(orderData) {
  let result = await pool.query(
    'INSERT INTO orders (user_id, status_id, delivery_id, payment_id,  order_total, create_time, recipient_name, recipient_phone, recipient_address, recipient_email,memo, point_discount) VALUES (?)',
    [orderData]
  );
  return result;
}

async function postOrderDetailById(cartItem) {
  let result = await pool.query('INSERT INTO order_detail (order_id, product_id, camping_id, picnic_id, quantity) VALUES ?', [cartItem]);
  return result;
}

module.exports = { getOrderDelivery, getOrderPayment, getOrders, getOrderDetailInfo, postOrderById, postOrderDetailById };
