const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

//회원가입
router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser); // 토큰 값을 헤더에 넣을꺼라 get사용 가능
// 토큰이 valid한 토큰인지, 이 token가지고 유저를 찾아서 리턴

module.exports = router;
