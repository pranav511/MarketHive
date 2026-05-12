const pool = require("../config/db");
const { deleteFromS3 } = require("../utils/s3");

exports.cleanupDeletedProducts = async () => {

  const [products] = await pool.query(`
    SELECT p.id, pi.image_url
    FROM products p
    LEFT JOIN product_images pi
    ON p.id = pi.product_id
    WHERE p.status='inactive'
    AND p.deleted_at < NOW() - INTERVAL 30 DAY
  `);

  for (let product of products) {

    // Delete S3 image
    if (product.image_url) {
      await deleteFromS3(product.image_url);
    }

    // Delete variants
    await pool.query(
      `DELETE FROM product_variants WHERE product_id=?`,
      [product.id]
    );

    // Delete images
    await pool.query(
      `DELETE FROM product_images WHERE product_id=?`,
      [product.id]
    );

    // Delete product
    await pool.query(
      `DELETE FROM products WHERE id=?`,
      [product.id]
    );
  }

};