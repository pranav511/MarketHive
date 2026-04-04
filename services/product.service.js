exports.createProduct = async ({ name, description, price, stock }) => {

  const [result] = await pool.query(
    `INSERT INTO products (name, description, price, stock)
     VALUES (?, ?, ?, ?)`,
    [name, description, price, stock]
  );

  return { id: result.insertId };
};