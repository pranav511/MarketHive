const pool = require("../config/db");
const razorpay = require("../config/razorpay");

// ======================================================
// PROCESS REFUND
// ======================================================

exports.processRefund = async (orderId) => {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ GET ORDER
    const [orders] = await conn.query(
      `SELECT * FROM orders WHERE id=?`,
      [orderId]
    );

    if (!orders.length) throw new Error("Order not found");

    const order = orders[0];

    // 2️⃣ VALIDATIONS
    if (order.payment_status !== "paid") {
      throw new Error("Only paid orders can be refunded");
    }

    if (order.refund_status === "refunded") {
      throw new Error("Already refunded");
    }

    if (!order.razorpay_payment_id) {
      throw new Error("Payment ID missing");
    }

    // 3️⃣ FETCH PAYMENT (VERIFY)
    console.log("Payment ID:", order.razorpay_payment_id);

const payment = await razorpay.payments.fetch(
  order.razorpay_payment_id
);

console.log("Payment Details:", payment);
console.log("Payment Amount:", payment.amount);
console.log("Payment Status:", payment.status);

    if (payment.status !== "captured") {
      throw new Error("Payment not captured yet");
    }

    console.log("PAYMENT OK:", payment.id);

    // 4️⃣ MARK PROCESSING
    await conn.query(
      `UPDATE orders SET refund_status='processing' WHERE id=?`,
      [orderId]
    );

    // ======================================================
    // ⭐ IMPORTANT FIX: USE RAZORPAY SDK (NOT AXIOS)
    // ======================================================

    const refund = await razorpay.payments.refund(
      order.razorpay_payment_id,
      {
        amount: payment.amount   // ALWAYS use payment.amount
      }
    );

    console.log("REFUND CREATED:", refund.id);

    // 5️⃣ UPDATE ORDER
    await conn.query(
      `UPDATE orders
       SET refund_status='refunded',
           refund_id=?,
           status='cancelled'
       WHERE id=?`,
      [refund.id, orderId]
    );

    // 6️⃣ RESTORE STOCK
    const [items] = await conn.query(
      `SELECT * FROM order_items WHERE order_id=?`,
      [orderId]
    );

    for (let item of items) {
      await conn.query(
        `UPDATE products SET stock = stock + ? WHERE id=?`,
        [item.quantity, item.product_id]
      );

      if (item.variant_id) {
        await conn.query(
          `UPDATE product_variants SET stock = stock + ? WHERE id=?`,
          [item.quantity, item.variant_id]
        );
      }
    }

    // 7️⃣ COMMIT
    await conn.commit();

    return {
      success: true,
      message: "Refund successful",
      refund
    };

  } catch (err) {
    if (conn) await conn.rollback();

    console.log("Refund Error:", err?.response?.data || err.message);

    throw err;

  } finally {
    if (conn) conn.release();
  }
};