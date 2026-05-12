// controllers/orderController.js

const orderService = require("../services/orderService");

exports.preview = async (req, res, next) => {
  try {

    const result = await orderService.checkoutPreview(
      req.user.id,
      req.body.addressId,
      req.body.couponCode
    );

    res.json({ success: true, summary: result });

  } catch (err) {
    next(err);
  }
};


exports.createOrder = async (req, res, next) => {
  try {

    const result = await orderService.createOrder(
      req.user.id,
      req.body.addressId,
      req.body.couponCode
    );

    res.json({ success: true, order: result });

  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (
  req,
  res,
  next
) => {

  try {

    const orders =
      await orderService.getMyOrders(
        req.user.id
      );

    res.json({
      success: true,
      orders
    });

  } catch (err) {

    next(err);

  }

};

exports.getOrderDetails = async (
  req,
  res,
  next
) => {

  try {

    const data =
      await orderService.getOrderDetails(
        req.user.id,
        req.params.id
      );

    res.json({
      success: true,
      data
    });

  } catch (err) {

    next(err);

  }

};

exports.cancelOrder = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await orderService.cancelOrder(
        req.user.id,
        req.params.id
      );

    res.json(result);

  } catch (err) {

    next(err);

  }

};