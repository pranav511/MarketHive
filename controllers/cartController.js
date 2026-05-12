const cartService = require("../services/cartService");

exports.addToCart = async (req, res, next) => {
  try {

    const result = await cartService.addToCart(
      req.user.id,
      req.body
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {

    const cart = await cartService.getCart(
      req.user.id
    );

    res.json({
      success: true,
      cart
    });

  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {

    const result = await cartService.updateCart(
      req.params.id,
      req.body.quantity
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {

    const result = await cartService.removeItem(
      req.params.id
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {

    const result = await cartService.clearCart(
      req.user.id
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};