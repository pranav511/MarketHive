const express = require("express");
const cors = require("cors");
const testDBConnection = require("./config/testDB");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productsRoutes")
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
require("dotenv").config();
require("./jobs/cleanupJob");

const app = express();
// webhook route BEFORE express.json
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());


app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


testDBConnection();

app.get("/", (req, res) => {
  res.send("Ecommerce API running");
});

app.use("/api/role", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});