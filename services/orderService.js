const pool = require("../config/db");

const { calculateShipping, calculateETA } = require("./shippingService");
const { applyCoupon } = require("./couponService");


// 🔹 CHECKOUT PREVIEW (no change)
exports.checkoutPreview = async (
  userId,
  addressId,
  couponCode
) => {

  const [items] = await pool.query(`
    SELECT 
      ci.quantity,
      ci.price
    FROM cart_items ci
    JOIN carts c 
      ON ci.cart_id = c.id
    WHERE c.user_id = ?
  `, [userId]);

  if (!items.length) {
    throw new Error("Cart empty");
  }

  let total = 0;

  for (let item of items) {
    total += item.price * item.quantity;
  }

  const [addr] = await pool.query(
    `SELECT * 
     FROM addresses
     WHERE id=? AND user_id=?`,
    [addressId, userId]
  );

  if (!addr.length) {
    throw new Error("Address not found");
  }

  const address = addr[0];

  const shipping = calculateShipping(total);

  const eta = calculateETA(address);

  let discount = 0;

  if (couponCode) {
    discount = await applyCoupon(
      couponCode,
      total
    );
  }

  const finalAmount =
    total +
    shipping.shipping_charge -
    discount;

  return {
    total,
    shipping: shipping.shipping_charge,
    discount,
    finalAmount,
    eta
  };
};


// 🔥 CREATE ORDER (FINAL CLEAN VERSION)

exports.createOrder = async (
  userId,
  addressId,
  couponCode
) => {

  const conn = await pool.getConnection();

  try {

    await conn.beginTransaction();

    // 1️⃣ GET CART ITEMS
    const [items] = await conn.query(`
      SELECT 
        ci.id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        ci.price
      FROM cart_items ci
      JOIN carts c
        ON ci.cart_id = c.id
      WHERE c.user_id=?
      FOR UPDATE
    `, [userId]);

    if (!items.length) {
      throw new Error("Cart empty");
    }

    // 2️⃣ STOCK VALIDATION
    for (let item of items) {

      // Product stock
      const [product] = await conn.query(
        `SELECT stock
         FROM products
         WHERE id=?
         FOR UPDATE`,
        [item.product_id]
      );

      if (!product.length) {
        throw new Error("Product not found");
      }

      if (product[0].stock < item.quantity) {
        throw new Error(
          `Insufficient product stock`
        );
      }

      // Variant stock
      const [variant] = await conn.query(
        `SELECT stock
         FROM product_variants
         WHERE id=?
         FOR UPDATE`,
        [item.variant_id]
      );

      if (!variant.length) {
        throw new Error("Variant not found");
      }

      if (variant[0].stock < item.quantity) {
        throw new Error(
          `Insufficient variant stock`
        );
      }

    }

    // 3️⃣ CALCULATE TOTAL
    let total = 0;

    for (let item of items) {
      total += item.price * item.quantity;
    }

    // 4️⃣ ADDRESS
    const [addr] = await conn.query(
      `SELECT *
       FROM addresses
       WHERE id=? AND user_id=?`,
      [addressId, userId]
    );

    if (!addr.length) {
      throw new Error("Address not found");
    }

    const address = addr[0];

    // 5️⃣ SHIPPING + ETA
    const shipping =
      calculateShipping(total);

    const eta =
      calculateETA(address);

    // 6️⃣ COUPON
    let discount = 0;

    if (couponCode) {

      discount = await applyCoupon(
        couponCode,
        total
      );

    }

    // 7️⃣ FINAL AMOUNT
    const finalAmount =
      total +
      shipping.shipping_charge -
      discount;

    // 8️⃣ CREATE ORDER
    const [order] = await conn.query(
      `INSERT INTO orders
      (
        user_id,
        total_amount,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        status,
        payment_status
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        finalAmount,
        address.full_name,
        address.phone,
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
        "pending",
        "pending"
      ]
    );

    const orderId = order.insertId;

    // 9️⃣ INSERT ORDER ITEMS
    for (let item of items) {

      await conn.query(
        `INSERT INTO order_items
        (
          order_id,
          product_id,
          variant_id,
          price,
          quantity,
          total
        )
        VALUES (?,?,?,?,?,?)`,
        [
          orderId,
          item.product_id,
          item.variant_id,
          item.price,
          item.quantity,
          item.price * item.quantity
        ]
      );

    }

    // 🔟 COMMIT
    await conn.commit();

    // 1️⃣1️⃣ RESPONSE
    return {

      orderId,

      total,

      shipping:
        shipping.shipping_charge,

      discount,

      finalAmount,

      eta

    };

  } catch (err) {

    await conn.rollback();

    throw err;

  } finally {

    conn.release();

  }

};

// 🔹 GET MY ORDERS

exports.getMyOrders = async (userId) => {

  const [orders] = await pool.query(
    `SELECT
        id,
        total_amount,
        status,
        payment_status,
        created_at
     FROM orders
     WHERE user_id=?
     ORDER BY created_at DESC`,
    [userId]
  );

  return orders;

};


// 🔹 GET ORDER DETAILS

exports.getOrderDetails = async (
  userId,
  orderId
) => {

  // 1️⃣ GET ORDER
  const [orders] = await pool.query(
    `SELECT
        id,
        total_amount,
        status,
        payment_status,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        created_at
     FROM orders
     WHERE id=? AND user_id=?`,
    [orderId, userId]
  );

  if (!orders.length) {
    throw new Error("Order not found");
  }

  const order = orders[0];

  // 2️⃣ GET ITEMS

  const [items] = await pool.query(
    `SELECT
        oi.id,
        oi.product_id,
        oi.variant_id,
        oi.price,
        oi.quantity,
        oi.total,

        p.name,

        pi.image_url

     FROM order_items oi

     JOIN products p
       ON oi.product_id = p.id

     LEFT JOIN product_images pi
       ON p.id = pi.product_id
       AND pi.is_primary = 1

     WHERE oi.order_id=?`,
    [orderId]
  );

  return {
    order,
    items
  };

};


// 🔹 CANCEL ORDER

exports.cancelOrder = async (
  userId,
  orderId
) => {

  const conn = await pool.getConnection();

  try {

    await conn.beginTransaction();

    // 1️⃣ GET ORDER
    const [orders] = await conn.query(
      `SELECT *
       FROM orders
       WHERE id=? AND user_id=?`,
      [orderId, userId]
    );

    if (!orders.length) {
      throw new Error("Order not found");
    }

    const order = orders[0];

    // 2️⃣ VALIDATE STATUS
    if (
      order.status === "shipped" ||
      order.status === "delivered" ||
      order.status === "cancelled"
    ) {
      throw new Error(
        "Order cannot be cancelled"
      );
    }

    // 3️⃣ UPDATE ORDER
    await conn.query(
      `UPDATE orders
       SET status='cancelled'
       WHERE id=?`,
      [orderId]
    );

    // 4️⃣ GET ORDER ITEMS
    const [items] = await conn.query(
      `SELECT *
       FROM order_items
       WHERE order_id=?`,
      [orderId]
    );

    // 5️⃣ RESTORE STOCK
    for (let item of items) {

      // product stock
      await conn.query(
        `UPDATE products
         SET stock = stock + ?
         WHERE id=?`,
        [
          item.quantity,
          item.product_id
        ]
      );

      // variant stock
      await conn.query(
        `UPDATE product_variants
         SET stock = stock + ?
         WHERE id=?`,
        [
          item.quantity,
          item.variant_id
        ]
      );

    }

    await conn.commit();

    return {
      success: true,
      message:
        "Order cancelled successfully"
    };

  } catch (err) {

    await conn.rollback();

    throw err;

  } finally {

    conn.release();

  }

};