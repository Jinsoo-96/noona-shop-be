const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

router.get("/", productController.getProducts);

router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);

router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);
// 휴지통
router.put(
  "/restore/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.restoreProduct
);

router.get(
  "/deleted",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.getDeletedProducts
);

router.get("/:id", productController.getProductById);
module.exports = router;
