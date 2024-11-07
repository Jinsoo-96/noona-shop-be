const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

router.post("/", authController.authenticate, orderController.createOrder);
router.post(
  "/check",
  authController.authenticate,
  orderController.checkOrderListStock
);

module.exports = router;
