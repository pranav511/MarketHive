const pool = require("./db");

const testDBConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL Connected");
  } catch (err) {
    console.error("DB Connection Failed:", err.message);
  }
};

module.exports = testDBConnection;