const pool = require("../config/db");


// ======================================================
// 🔹 GET ALL ORDERS
// ======================================================

exports.getAllOrders = async () => {

  const [orders] = await pool.query(
    `SELECT
        id,
        user_id,
        total_amount,
        status,
        payment_status,
        created_at
     FROM orders
     ORDER BY created_at DESC`
  );

  return orders;

};


// ======================================================
// 🔹 UPDATE ORDER STATUS
// ======================================================

exports.updateOrderStatus = async (
  orderId,
  status
) => {

  const allowedStatuses = [
    "processing",
    "shipped",
    "delivered"
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new Error(
      "Invalid status"
    );
  }

  // 🔹 CHECK ORDER
  const [orders] = await pool.query(
    `SELECT * FROM orders
     WHERE id=?`,
    [orderId]
  );

  if (!orders.length) {
    throw new Error(
      "Order not found"
    );
  }

  const order = orders[0];

  // 🔹 CANCELLED CHECK
  if (order.status === "cancelled") {
    throw new Error(
      "Cancelled order cannot be updated"
    );
  }

  await pool.query(
    `UPDATE orders
     SET status=?
     WHERE id=?`,
    [status, orderId]
  );

  return {
    success: true,
    message:
      "Order status updated"
  };

};


exports.updateShipment = async (
  orderId,
  data
) => {

  const {
    tracking_id,
    courier_name,
    shipment_status,
    estimated_delivery
  } = data;

  // ✅ VALID STATUS
  const allowedStatuses = [
    "processing",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered"
  ];

  if (
    !allowedStatuses.includes(
      shipment_status
    )
  ) {
    throw new Error(
      "Invalid shipment status"
    );
  }

  // ✅ CHECK ORDER
  const [orders] = await pool.query(
    `SELECT * FROM orders
     WHERE id=?`,
    [orderId]
  );

  if (!orders.length) {
    throw new Error(
      "Order not found"
    );
  }

  // ✅ UPDATE SHIPMENT
  await pool.query(
    `UPDATE orders
     SET
       tracking_id=?,
       courier_name=?,
       shipment_status=?,
       estimated_delivery=?
     WHERE id=?`,
    [
      tracking_id,
      courier_name,
      shipment_status,
      estimated_delivery,
      orderId
    ]
  );

  return {
    success: true,
    message:
      "Shipment updated successfully"
  };

};