const express = require("express");
const router = express.Router();

const { createRole, getRoles} = require("../controllers/roleController");
const { roleSchema } = require("../validators/roleValidator");
const validate = require("../middlewares/validate");

router.post("/", validate(roleSchema), createRole);

router.get("/", getRoles);

module.exports = router;