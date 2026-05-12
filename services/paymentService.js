// const pool = require("../config/db");
// const razorpay = require("../config/razorpay");

// exports.createPayment = async (userId, orderId, method) => {

//   // Check order exists
//   const [order] = await pool.query(
//     `SELECT * FROM orders WHERE id=? AND user_id=?`,
//     [orderId, userId]
//   );

//   if (!order.length) {
//     throw new Error("Order not found");
//   }

//   const amount = order[0].total_amount;

//   // Create payment record
//   const [payment] = await pool.query(
//     `INSERT INTO payments 
//     (order_id, payment_method, amount)
//     VALUES (?,?,?)`,
//     [orderId, method, amount]
//   );

//   return {
//     paymentId: payment.insertId,
//     amount
//   };

// };

// exports.paymentSuccess = async (paymentId, transactionId) => {

//   const conn = await pool.getConnection();

//   try {

//     await conn.beginTransaction();

//     // Update payment
//     await conn.query(
//       `UPDATE payments 
//        SET payment_status='success',
//        transaction_id=?
//        WHERE id=?`,
//       [transactionId, paymentId]
//     );

//     // Get order
//     const [payment] = await conn.query(
//       `SELECT order_id FROM payments WHERE id=?`,
//       [paymentId]
//     );

//     const orderId = payment[0].order_id;

//     // Update order
//     await conn.query(
//       `UPDATE orders 
//        SET payment_status='paid',
//        status='paid'
//        WHERE id=?`,
//       [orderId]
//     );

//     await conn.commit();

//     return { message: "Payment success" };

//   } catch (err) {

//     await conn.rollback();
//     throw err;

//   } finally {

//     conn.release();

//   }

// };


// exports.createRazorpayOrder = async (order) => {

//   const options = {
//     amount: order.totalAmount * 100, // paise
//     currency: "INR",
//     receipt: `order_${order.orderId}`
//   };

//   const razorpayOrder = await razorpay.orders.create(options);

//   return razorpayOrder;
// };