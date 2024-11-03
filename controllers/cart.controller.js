const { populate } = require("dotenv");
const Cart = require("../models/Cart");

const cartController = {};
cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    // 유저가 만든 카트가 없다, 만들어주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가 있는 아이템이냐?
    const existItem = cart.items.find(
      (items) => items.productId.equals(productId) && items.size === size // 몽구스  equals는 type이 mongoose.ObjectId 인것에 사용
    );
    // 그렇다면 에러("이미 아이템이 카트에 있습니다" or 그냥 수량 증가시키면 안되나?
    if (existItem) {
      throw new Error("아이템이 이미 카트에 담겨 있습니다!");
    }
    // 카트에 아이템을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();

    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { countOnly } = req.query; // 쿼리 파라미터에서 조건을 가져오기
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      // 몽구스 파풀레이트 사용법 익히기 외래키 사용할때 참고
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (countOnly === "true") {
      return res
        .status(200)
        .json({ status: "success", cartItemQty: cart.items.length });
    }
    if (!cart) {
      // addItemToCart 단계에서 만들어주기 때문에 처음 가입한 사람이 장바구니 들어올때 오류남
      return res.status(200).json({ status: "success", data: [] });
    }
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 장바구니 아이템 삭제
cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;

    // 해당 유저의 카트 찾기
    const cart = await Cart.findOne({ userId });

    // items 배열에서 해당 아이템 제거
    cart.items = cart.items.filter((item) => !item._id.equals(itemId));
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "상품이 삭제되었습니다.",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

// 장바구니 수량 업데이트
cartController.updateQty = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;
    const { qty } = req.body;

    if (qty < 1) {
      throw new Error("수량은 1개 이상이어야 합니다.");
    }

    // 해당 유저의 카트 찾기
    const cart = await Cart.findOne({ userId });

    // 해당 아이템 찾아서 수량 업데이트
    const cartItem = cart.items.find((item) => item._id.equals(itemId));

    cartItem.qty = qty;
    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

module.exports = cartController;
