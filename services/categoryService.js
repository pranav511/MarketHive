const pool = require("../config/db");

// Create Category
exports.createCategory = async (data) => {
  const { name, description, status } = data;
  console.log(status);
  

  const [result] = await pool.query(
    `INSERT INTO categories (name, description, status)
     VALUES (?, ?, ?)`,
    [name, description, status || "active"]
  );

  return { id: result.insertId, name };
};


// Get All Categories
exports.getCategories = async () => {

  const [rows] = await pool.query(
    `SELECT * FROM categories ORDER BY created_at ASC`
  );

  return rows;
};


// Get Single Category
exports.getCategoryById = async (id) => {

  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE id = ?`,
    [id]
  );

  return rows[0];
};


// Update Category
exports.updateCategory = async (id, data) => {

  const { name, description, status } = data;

  await pool.query(
    `UPDATE categories 
     SET name=?, description=?, status=? 
     WHERE id=?`,
    [name, description, status, id]
  );

  return { message: "Category updated" };
};


// Delete Category
exports.deleteCategory = async (id) => {

  await pool.query(
    `DELETE FROM categories WHERE id=?`,
    [id]
  );

  return { message: "Category deleted" };
};