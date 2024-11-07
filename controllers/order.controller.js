const orderController = {};
const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 데이터 보낸거 받아와
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    // 재고 확인 & 재고 업데이트 // 재고 확인할때 차감하지 않음
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    // 재고가 충분하지 않는 아이템이 있었다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message + "\n"),
        ""
      );
      throw new Error(errorMessage);
    }
    // order를 만들자!
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    // 재고 확인 후 결제하도록 해야한다.

    // 재고가 충분하면 차감
    await Promise.all(
      orderList.map((item) => productController.decreaseStock(item))
    );

    await newOrder.save();
    // save 후에 카트를 비워주자
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
