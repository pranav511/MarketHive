const pool = require("../config/db");

exports.addToCart = async (userId, data) => {

  const { product_id, variant_id, quantity = 1 } = data;

  // Quantity validation
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  // Check active product
  const [product] = await pool.query(
    `SELECT id, price, stock, status
     FROM products
     WHERE id=? AND status='active'`,
    [product_id]
  );

  if (!product.length) {
    throw new Error("Product not available");
  }

  // Product stock validation
  if (product[0].stock < quantity) {
    throw new Error("Insufficient product stock");
  }

  // Check variant
  const [variant] = await pool.query(
    `SELECT id, stock, price_adjustment
     FROM product_variants
     WHERE id=? AND product_id=?`,
    [variant_id, product_id]
  );

  if (!variant.length) {
    throw new Error("Invalid variant");
  }

  // Variant stock validation
  if (variant[0].stock < quantity) {
    throw new Error("Insufficient variant stock");
  }

  // Final variant price
  const finalPrice =
    Number(product[0].price) +
    Number(variant[0].price_adjustment);

  // Check cart exists
  let [cart] = await pool.query(
    `SELECT id FROM carts WHERE user_id=?`,
    [userId]
  );

  let cartId;

  if (!cart.length) {

    const [newCart] = await pool.query(
      `INSERT INTO carts (user_id) VALUES (?)`,
      [userId]
    );

    cartId = newCart.insertId;

  } else {
    cartId = cart[0].id;
  }

  // Check existing item
  const [existingItem] = await pool.query(
    `SELECT id, quantity
     FROM cart_items
     WHERE cart_id=? AND variant_id=?`,
    [cartId, variant_id]
  );

  if (existingItem.length) {

    const newQuantity =
      existingItem[0].quantity + quantity;

    // Validate stock again
    if (newQuantity > variant[0].stock) {
      throw new Error(
        "Cannot add more than available stock"
      );
    }

    await pool.query(
      `UPDATE cart_items
       SET quantity=?, price=?
       WHERE id=?`,
      [
        newQuantity,
        finalPrice,
        existingItem[0].id
      ]
    );

  } else {

    await pool.query(
      `INSERT INTO cart_items
      (
        cart_id,
        product_id,
        variant_id,
        quantity,
        price
      )
      VALUES (?,?,?,?,?)`,
      [
        cartId,
        product_id,
        variant_id,
        quantity,
        finalPrice
      ]
    );
  }

  return {
    message: "Item added to cart"
  };
};

exports.getCart = async (userId) => {

  const [cart] = await pool.query(
    `SELECT id FROM carts WHERE user_id=?`,
    [userId]
  );

  if (!cart.length) return [];

  const cartId = cart[0].id;

  const [items] = await pool.query(
  `SELECT 
    ci.id,
    ci.cart_id,
    ci.product_id,
    ci.variant_id,
    ci.quantity,
    ci.created_at,
    p.name,
    p.price,
    pv.variant_name,
    pv.variant_value,
    JSON_ARRAYAGG(pi.image_url) AS images
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  LEFT JOIN product_variants pv 
    ON ci.variant_id = pv.id
  LEFT JOIN product_images pi 
    ON p.id = pi.product_id
  WHERE ci.cart_id=?
  GROUP BY ci.id`,
  [cartId]
);

  return items;
};

exports.updateCart = async (itemId, quantity) => {

  const [result] = await pool.query(
    `UPDATE cart_items 
     SET quantity=? 
     WHERE id=?`,
    [quantity, itemId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Cart item not found");
  }

  return { message: "Cart updated" };
};

exports.removeItem = async (itemId) => {
  if (!itemId) {
    throw new Error("Item ID is required");
  }

  const [result] = await pool.query(
    `DELETE FROM cart_items WHERE id=?`,
    [itemId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Item not found");
  }

  return { message: "Item removed" };
};

exports.clearCart = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const [cart] = await pool.query(
    `SELECT id FROM carts WHERE user_id=?`,
    [userId]
  );

  if (!cart.length) {
    throw new Error("Cart not found");
  }

  await pool.query(
    `DELETE FROM cart_items WHERE cart_id=?`,
    [cart[0].id]
  );

  return { message: "Cart cleared" };
};
