const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

router.get("/me", authController.authenticate, orderController.getOrder);

router.post("/", authController.authenticate, orderController.createOrder);
router.post(
  "/check",
  authController.authenticate,
  orderController.checkOrderListStock
);

router.get("/", authController.authenticate, orderController.getOrderList);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
