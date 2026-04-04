const pool = require("../config/db");

// CREATE
exports.createCategory = async ({ name, description }) => {

  const [existing] = await pool.query(
    "SELECT id FROM categories WHERE name=?",
    [name]
  );

  if (existing.length) {
    throw { status: 400, message: "Category already exists" };
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const [result] = await pool.query(
    `INSERT INTO categories (name, slug, description)
     VALUES (?, ?, ?)`,
    [name, slug, description]
  );

  return { id: result.insertId };
};

// GET ALL
exports.getCategories = async () => {

  const [rows] = await pool.query(
    "SELECT * FROM categories WHERE status='active'"
  );

  return rows;
};

// UPDATE
exports.updateCategory = async (id, data) => {

  const { name, description, status } = data;

  const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : undefined;

  await pool.query(
    `UPDATE categories
     SET name = COALESCE(?, name),
         slug = COALESCE(?, slug),
         description = COALESCE(?, description),
         status = COALESCE(?, status)
     WHERE id = ?`,
    [name, slug, description, status, id]
  );

  return { message: "Category updated" };
};

// DELETE (Soft Delete)
exports.deleteCategory = async (id) => {

  await pool.query(
    "UPDATE categories SET status='inactive' WHERE id=?",
    [id]
  );

  return { message: "Category deleted" };
}