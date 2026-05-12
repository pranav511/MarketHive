const pool = require("../config/db");

exports.addAddress = async (userId, data) => {

  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    is_default
  } = data;

  // If default address remove previous default
  if (is_default) {
    await pool.query(
      `UPDATE addresses 
       SET is_default=0 
       WHERE user_id=?`,
      [userId]
    );
  }

  const [result] = await pool.query(
    `INSERT INTO addresses 
    (user_id, full_name, phone, address_line1,
    address_line2, city, state, postal_code,
    country, is_default)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default || false
    ]
  );

  return {
    id: result.insertId
  };
};

exports.getAddresses = async (userId) => {

  const [addresses] = await pool.query(
    `SELECT * 
     FROM addresses 
     WHERE user_id=?
     ORDER BY is_default DESC`,
    [userId]
  );

  return addresses;
};

exports.updateAddress = async (userId, addressId, data) => {

  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    is_default
  } = data;


  // If default address → remove old default
  if (is_default) {
    await pool.query(
      `UPDATE addresses 
       SET is_default=0 
       WHERE user_id=?`,
      [userId]
    );
  }


  const [result] = await pool.query(
    `UPDATE addresses
     SET full_name=?, phone=?, address_line1=?,
     address_line2=?, city=?, state=?,
     postal_code=?, country=?, is_default=?
     WHERE id=? AND user_id=?`,
    [
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default || false,
      addressId,
      userId
    ]
  );


  if (!result.affectedRows) {
    throw new Error("Address not found");
  }

  return { message: "Address updated" };
};

exports.deleteAddress = async (userId, addressId) => {

  // Check address exists
  const [address] = await pool.query(
    `SELECT * FROM addresses 
     WHERE id=? AND user_id=?`,
    [addressId, userId]
  );

  if (!address.length) {
    throw new Error("Address not found");
  }

  const isDefault = address[0].is_default;

  // Delete address
  await pool.query(
    `DELETE FROM addresses 
     WHERE id=?`,
    [addressId]
  );

  // If default deleted → set another default
  if (isDefault) {

    const [another] = await pool.query(
      `SELECT id FROM addresses 
       WHERE user_id=? 
       LIMIT 1`,
      [userId]
    );

    if (another.length) {
      await pool.query(
        `UPDATE addresses 
         SET is_default=1 
         WHERE id=?`,
        [another[0].id]
      );
    }

  }

  return { message: "Address deleted" };
};

exports.setDefaultAddress = async (userId, addressId) => {

  // Remove old default
  await pool.query(
    `UPDATE addresses 
     SET is_default=0 
     WHERE user_id=?`,
    [userId]
  );

  // Set new default
  const [result] = await pool.query(
    `UPDATE addresses 
     SET is_default=1 
     WHERE id=? AND user_id=?`,
    [addressId, userId]
  );

  if (!result.affectedRows) {
    throw new Error("Address not found");
  }

  return { message: "Default address updated" };
};