// controllers/paymentController.js

const pool = require("../config/db");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// ======================================================
// 🔹 CREATE RAZORPAY ORDER
// ======================================================

exports.createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    // console.log(orderId)

    // 1️⃣ CHECK ORDER EXISTS
    const [orders] = await pool.query(`SELECT * FROM orders WHERE id=?`, [
      orderId,
    ]);

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderData = orders[0];

    console.log(orderData.payment_status);
    

    // 2️⃣ PREVENT DUPLICATE PAYMENT
    if (orderData.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // 3️⃣ CREATE RAZORPAY ORDER
    const options = {
      amount: orderData.total_amount * 100, // paisa
      currency: "INR",
      receipt: `receipt_${orderId}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4️⃣ SAVE RAZORPAY ORDER ID
    await pool.query(
      `UPDATE orders
       SET razorpay_order_id=?
       WHERE id=?`,
      [razorpayOrder.id, orderId],
    );
razorpayOrder
    // 5️⃣ RESPONSE
    res.json({
      success: true,
      order: razorpayOrder,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// 🔹 VERIFY PAYMENT
// ======================================================

exports.verifyPayment = async (req, res) => {

  try {

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // 1️⃣ GET ORDER FROM DB
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE id=?`,
      [orderId]
    );

    console.log("2",orders.insertId);
    console.log("2",orderId);
    

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // 2️⃣ CHECK ALREADY PAID
    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // 3️⃣ MATCH RAZORPAY ORDER ID
    if (order.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid razorpay order id",
      });
    }

    // 4️⃣ GENERATE SIGNATURE
    const generated_signature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // 5️⃣ VERIFY SIGNATURE
    if (
      generated_signature !== razorpay_signature
    ) {

      await pool.query(
        `UPDATE orders
         SET payment_status='failed'
         WHERE id=?`,
        [orderId]
      );

      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // 6️⃣ UPDATE PAYMENT SUCCESS
    await pool.query(
      `UPDATE orders
       SET
         status='paid',
         payment_status='paid',
         razorpay_payment_id=?,
         razorpay_signature=?
       WHERE id=?`,
      [
        razorpay_payment_id,
        razorpay_signature,
        orderId
      ]
    );

    // 7️⃣ GET ORDER ITEMS
    const [items] = await pool.query(
      `SELECT * FROM order_items
       WHERE order_id=?`,
      [orderId]
    );

    // 8️⃣ REDUCE STOCK
    for (let item of items) {

      // Product stock
      await pool.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id=?`,
        [item.quantity, item.product_id]
      );

      // Variant stock
      await pool.query(
        `UPDATE product_variants
         SET stock = stock - ?
         WHERE id=?`,
        [item.quantity, item.variant_id]
      );

    }

    // 9️⃣ CLEAR CART
    await pool.query(
      `DELETE ci
       FROM cart_items ci
       JOIN carts c
       ON ci.cart_id = c.id
       WHERE c.user_id=?`,
      [order.user_id]
    );

    // 🔟 SUCCESS RESPONSE
    return res.json({
      success: true,
      message:
        "Payment verified successfully ✅",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

exports.webhook = async (req, res) => {

  try {

    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature =
      req.headers["x-razorpay-signature"];

    const body = req.body;

    // 🔹 GENERATE SIGNATURE
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // 🔹 VERIFY WEBHOOK
    if (expectedSignature !== signature) {

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature"
      });

    }

    // 🔹 CONVERT BUFFER → JSON
    const payload =
      JSON.parse(body.toString());


      console.log("WEBHOOK HIT");

console.log(
  "BODY =>",
  payload
);

console.log(
  "RAZORPAY ORDER ID =>",
  razorpayOrderId
);

    // 🔹 EVENT
    const event = payload.event;

    // =================================================
    // PAYMENT CAPTURED
    // =================================================

    if (
      event === "payment.captured"
    ) {

      const payment =
        payload.payload.payment.entity;

      const razorpayOrderId =
        payment.order_id;

      const razorpayPaymentId =
        payment.id;

      // 🔹 GET ORDER
      const [orders] = await pool.query(
        `SELECT *
         FROM orders
         WHERE razorpay_order_id=?`,
        [razorpayOrderId]
      );

      if (!orders.length) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      const order = orders[0];

      // 🔹 ALREADY PAID
      if (
        order.payment_status === "paid"
      ) {

        return res.json({
          success: true,
          message: "Already processed"
        });

      }

      // 🔹 UPDATE ORDER
      await pool.query(
        `UPDATE orders
         SET
           status='paid',
           payment_status='paid',
           razorpay_payment_id=?
         WHERE id=?`,
        [
          razorpayPaymentId,
          order.id
        ]
      );

      // 🔹 GET ITEMS
      const [items] = await pool.query(
        `SELECT *
         FROM order_items
         WHERE order_id=?`,
        [order.id]
      );

      // 🔹 REDUCE STOCK
      for (let item of items) {

        await pool.query(
          `UPDATE products
           SET stock = stock - ?
           WHERE id=?`,
          [
            item.quantity,
            item.product_id
          ]
        );

        await pool.query(
          `UPDATE product_variants
           SET stock = stock - ?
           WHERE id=?`,
          [
            item.quantity,
            item.variant_id
          ]
        );

      }

      // 🔹 CLEAR CART
      await pool.query(
        `DELETE ci
         FROM cart_items ci
         JOIN carts c
         ON ci.cart_id = c.id
         WHERE c.user_id=?`,
        [order.user_id]
      );

    }

    return res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};