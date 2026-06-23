const refundService =
require("../services/refundService");


// ======================================================
// 🔹 PROCESS REFUND
// ======================================================

exports.processRefund = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await refundService
      .processRefund(
        req.params.id
      );

    res.json(result);

  } catch (err) {

    next(err);

  }

};