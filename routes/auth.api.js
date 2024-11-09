const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login", authController.loginWithEmail);
router.post("/google", authController.loginWithGoogle);

//get은 body를 보내지 않고, post는 body를 보낸다.

module.exports = router;
