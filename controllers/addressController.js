const addressService = require("../services/addressService");

exports.addAddress = async (req, res, next) => {
  try {

    const result =
      await addressService.addAddress(
        req.user.id,
        req.body
      );

    res.json({
      success: true,
      address: result
    });

  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {

    const addresses =
      await addressService.getAddresses(
        req.user.id
      );

    res.json({
      success: true,
      addresses
    });

  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {

    const result =
      await addressService.updateAddress(
        req.user.id,
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {

    const result =
      await addressService.deleteAddress(
        req.user.id,
        req.params.id
      );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {

    const result =
      await addressService.setDefaultAddress(
        req.user.id,
        req.params.id
      );

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }
};