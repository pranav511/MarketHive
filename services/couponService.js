// services/couponService.js

const pool = require("../config/db");

exports.applyCoupon = async (code, totalAmount) => {

  const [rows] = await pool.query(
    `SELECT * FROM coupons WHERE code=? AND is_active=1`,
    [code]
  );

  if (!rows.length) {
    throw new Error("Invalid coupon");
  }

  const coupon = rows[0];

  if (new Date() > new Date(coupon.expires_at)) {
    throw new Error("Coupon expired");
  }

  if (totalAmount < coupon.min_order_amount) {
    throw new Error("Minimum order not met");
  }

  let discount = 0;

  if (coupon.discount_type === "flat") {
    discount = coupon.discount_value;
  } else {

    discount = (totalAmount * coupon.discount_value) / 100;

    if (discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  }

  return discount;
};