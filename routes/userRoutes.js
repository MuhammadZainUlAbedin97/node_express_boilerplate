const express = require("express");
const { authenticateUser } = require("../middleware/authentication");
const { showCurrentUser } = require("../controllers/userController");
const router = express.Router();

router.route("/show-me").get(authenticateUser, showCurrentUser);

module.exports = router;
