const Product = require("../models/Product");
const PAGE_SIZE = 5;

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      statue,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      statue,
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    // if (name) {
    //   const product = await Product.find({
    //     name: { $regex: name, $options: "i" },
    //   }); // 9-16강의 내용
    // } else {
    //   const products = await Product.find({});
    // }
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond).sort({ updatedAt: -1 }); // updatedAt 기준 내림차순 정렬 추가
    let response = { status: "success" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE); // -> mongoose함수 이해하자
      // 최종 몇개 페이지?
      // 데이터가 총 몇개 잇는지
      const totalItemNum = await Product.find(cond).countDocuments(); // -> mongoose함수 이해하자 count() 이제 없음.
      // 데이터 총 개수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
