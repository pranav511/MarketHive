const db = require("../config/db");

exports.createRole = async (role_name) => {

  const [exist] = await db.query(
    "SELECT * FROM roles WHERE role_name = ?",
    [role_name]
  );

  if (exist.length > 0) {
    throw new Error("Role already exists");
  }

  const [result] = await db.query(
    "INSERT INTO roles (role_name) VALUES (?)",
    [role_name]
  );

  return {
    id: result.insertId,
    role_name
  };
};


exports.getRoles = async () => {

  const [roles] = await db.query(
    "SELECT * FROM roles"
  );

  return roles;
};