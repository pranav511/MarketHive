const express = require("express");
const cors = require("cors");
const testDBConnection = require("./config/testDB");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes")
const cookieParser = require("cookie-parser");
require("dotenv").config();




const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

testDBConnection();

app.get("/", (req, res) => {
  res.send("Ecommerce API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});