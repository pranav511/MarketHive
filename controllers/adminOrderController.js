const adminOrderService =
require("../services/adminOrderService");


// ======================================================
// 🔹 GET ALL ORDERS
// ======================================================

exports.getAllOrders = async (
  req,
  res,
  next
) => {

  try {

    const orders =
      await adminOrderService
      .getAllOrders();

    res.json({
      success: true,
      orders
    });

  } catch (err) {

    next(err);

  }

};

// ======================================================
// 🔹 UPDATE STATUS
// ======================================================

exports.updateOrderStatus = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await adminOrderService
      .updateOrderStatus(
        req.params.id,
        req.body.status
      );

    res.json(result);

  } catch (err) {

    next(err);

  }

};

exports.updateShipment = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await adminOrderService
      .updateShipment(
        req.params.id,
        req.body
      );

    res.json(result);

  } catch (err) {

    next(err);

  }

};