exports.checkoutPreview = async (userId, addressId, couponCode) => {

  // Get cart items
  const [items] = await pool.query(`
    SELECT ci.quantity, p.price
    FROM cart_items ci
    JOIN carts c ON ci.cart_id=c.id
    JOIN products p ON ci.product_id=p.id
    WHERE c.user_id=?
  `, [userId]);

  let total = 0;

  for (let i of items) {
    total += i.price * i.quantity;
  }

  // Get address
  const [addr] = await pool.query(
    `SELECT * FROM addresses WHERE id=? AND user_id=?`,
    [addressId, userId]
  );

  const address = addr[0];

  // Shipping
  const shipping =
    require("./shippingService")
    .calculateShipping(total, address);

  // ETA
  const eta =
    require("./shippingService")
    .calculateETA(address);

  let discount = 0;

  if (couponCode) {
    const result =
      await require("./couponService")
      .applyCoupon(couponCode, total);

    discount = result.discount;
  }

  const finalAmount =
    total + shipping.shipping_charge - discount;

  return {
    total,
    shipping: shipping.shipping_charge,
    discount,
    finalAmount,
    eta
  };
};