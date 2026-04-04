const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { getProfile } = require("../controllers/userController");

const checkBlacklist = require("../middlewares/checkBlacklist");

router.get(
    "/profile",
    checkBlacklist,
    authenticate,
    getProfile);

module.exports = router;