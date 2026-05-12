const pool = require('../config/db');
const { uploadToS3 } = require('../utils/s3'); // write utility for S3 upload
const { uploadToLocal } = require('../utils/localUpload');


exports.createProduct = async (user, data, files) => {
  const { name, description, price, stock, category_id, variants } = data;

  // Insert product
  const [result] = await pool.query(
    `INSERT INTO products 
    (name, description, price, stock, category_id, owner_id) 
    VALUES (?,?,?,?,?,?)`,
    [name, description, price, stock, category_id, user.id]
  );

  const productId = result.insertId;

  // Upload images
  const imageUrls = [];
  if (files && files.length) {
    for (let file of files) {
      // const url = await uploadToS3(file); // returns S3 URL
      const url = await uploadToLocal(file);
      await pool.query(
        `INSERT INTO product_images (product_id, image_url) VALUES (?,?)`,
        [productId, url]
      );
      imageUrls.push(url);
    }
  }

  // Insert variants
  if (variants && variants.length) {
    for (let v of variants) {
      const { variant_name, variant_value, price_adjustment, stock, sku } = v;
      await pool.query(
        `INSERT INTO product_variants 
        (product_id, variant_name, variant_value, price_adjustment, stock, sku) 
        VALUES (?,?,?,?,?,?)`,
        [productId, variant_name, variant_value, price_adjustment, stock, sku]
      );
    }
  }

  return { productId, imageUrls };
};

exports.getProducts = async (query) => {

  const {
    page = 1,
    limit = 10,
    search = "",
    category_id,
    min_price,
    max_price
  } = query;

  const offset = (page - 1) * limit;

  let sql = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active'
  `;

  const params = [];

  // Search
  if (search) {
    sql += ` AND p.name LIKE ?`;
    params.push(`%${search}%`);
  }

  // Category filter
  if (category_id) {
    sql += ` AND p.category_id = ?`;
    params.push(category_id);
  }

  // Price filter
  if (min_price) {
    sql += ` AND p.price >= ?`;
    params.push(min_price);
  }

  if (max_price) {
    sql += ` AND p.price <= ?`;
    params.push(max_price);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(sql, params);

  return rows;
};

exports.getProductById = async (id) => {

  const [product] = await pool.query(
    `SELECT * FROM products WHERE id = ?`,
    [id]
  );

  const [images] = await pool.query(
    `SELECT * FROM product_images WHERE product_id = ?`,
    [id]
  );

  const [variants] = await pool.query(
    `SELECT * FROM product_variants WHERE product_id = ?`,
    [id]
  );

  return {
    ...product[0],
    images,
    variants
  };
};

exports.updateProduct = async (id, data) => {

  const { name, description, price, stock, category_id } = data;

  await pool.query(
    `UPDATE products
     SET name=?, description=?, price=?, stock=?, category_id=?
     WHERE id=?`,
    [name, description, price, stock, category_id, id]
  );

  return { message: "Product updated" };
};

exports.deleteProduct = async (id) => {

  await pool.query(
    `UPDATE products
     SET status='inactive'
     WHERE id=?`,
    [id]
  );

  return { message: "Product deleted" };
};