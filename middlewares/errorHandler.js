module.exports = (err, req, res, next) => {

  console.error("error:", err);

  let message = err.message;

  if (typeof message === "object") {
    message = JSON.stringify(message);
  }

  res.status(err.status || 500).json({
    success: false,
    message: message || "Internal Server Error"
  });

};