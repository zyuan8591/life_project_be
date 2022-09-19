const pool = require('../utils/db');

async function getOrderDelivery() {
  let [data] = await pool.execute('SELECT * FROM order_delivery');
  return data;
}

async function getOrderPayment() {
  let [data] = await pool.execute('SELECT * FROM order_payment');
  return data;
}

async function getOrderCount(user) {
  let total = await pool.query(`SELECT COUNT(*) AS total FROM orders WHERE orders.user_id = ?`, user);
  return total;
}

async function getOrders(status, user) {
  // console.log(status);
  // console.log(user);
  let sql =
    'SELECT orders.*, users.name AS user_name, order_status.order_status AS order_status, order_delivery.order_delivery AS order_delivery, order_payment.order_payment AS order_payment FROM orders JOIN users ON orders.user_id = users.id JOIN order_status ON orders.status_id = order_status.id JOIN order_delivery ON orders.delivery_id = order_delivery.id JOIN order_payment ON orders.payment_id = order_payment.id WHERE valid = 1 ';
  let sqlParams = [];
  if (status) {
    sql += 'AND orders.status_id = ?';
    sqlParams.push(status);
  }
  if (user) {
    sql += ' AND orders.user_id = ?';
    sqlParams.push(user);
  }
  console.log('sql', sql);
  let ordersResult = await pool.execute(sql, sqlParams);
  return ordersResult;
}

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

module.exports = { getOrderDelivery, getOrderPayment, getOrderCount, getOrders, getOrderDetailInfo, postOrderById, postOrderDetailById };
