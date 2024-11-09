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
      productAt: new Date(), // 상품이 처음 생성된 시각을 저장
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name, category } = req.query;
    let response = { status: "success" };
    // if (name) {
    //   const product = await Product.find({
    //     name: { $regex: name, $options: "i" },
    //   }); // 9-16강의 내용
    // } else {
    //   const products = await Product.find({});
    // }

    // const cond = name
    //   ? { name: { $regex: name, $options: "i" }, isDeleted: false }
    //   : { isDeleted: false };

    // 카테고리까지 필터링
    // // 조건 객체 초기화
    // let cond = { isDeleted: false }; // 기본 조건: 삭제되지 않은 제품

    // // 이름 필터링 조건 추가
    // if (name) {
    //   cond.name = { $regex: name, $options: "i" };
    // }

    // // 카테고리 필터링 조건 추가
    // if (category) {
    //   cond.category = { $in: [category] };
    // }
    const cond = {
      isDeleted: false,
      ...(name && { name: { $regex: name, $options: "i" } }),
      ...(category && { category: { $in: [category] } }),
    };

    let query = Product.find(cond).sort({ productAt: -1 }); // updatedAt 기준 내림차순 정렬 추가

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE); // -> mongoose함수 이해하자
      // 최종 몇개 페이지?
      // 데이터가 총 몇개 잇는지
      const totalItemNum = await Product.find(cond).countDocuments(); // -> mongoose함수 이해하자 count() 이제 없음.
      // 데이터 총 개수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

      if (totalPageNum <= 1) {
        response.totalPageNum = 1;
      } else {
        response.totalPageNum = totalPageNum;
      }
    }
    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        size,
        image,
        price,
        description,
        category,
        stock,
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!product) throw new Error("Item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 실제 삭제 로직
productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true, updatedAt: Date.now() },
      { new: true }
    );
    if (!product) throw new Error("No item found");
    res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 디테일
productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) throw new Error("No item found");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};
productController.checkStock = async (item) => {
  // 내가 사려는 아이템 재고 정보 들고오기
  const product = await Product.findById(item.productId);
  // 내가 사려는 아이템 qty, 재고 비교
  if (product.stock[item.size] < item.qty) {
    // 재고가 불충분하면 불충분 메세지와 함께 데이터 반환
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다.`,
    };
  }
  // const newStock = { ...product.stock };
  // newStock[item.size] -= item.qty;
  // product.stock = newStock;

  // await product.save();
  // 충분하다면, 재고에서 -qty 성공
  return { isVerify: true };
};

productController.decreaseStock = async (item) => {
  const product = await Product.findById(item.productId);
  // product.stock[item.size] -= item.qty;
  // await product.save();

  const newStock = { ...product.stock }; // 새로 객체를 만들어야 반영이 됨 ㅠ
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = []; // 재고가 불충분한 아이템을 저장할 예정
  // 재고 확인 로직
  await Promise.all(
    // 배열을 한꺼번에 await을 해야할 경우?
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

// 휴지통 기능
productController.getDeletedProducts = async (req, res) => {
  try {
    const deletedProducts = await Product.find({ isDeleted: true }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ status: "success", data: deletedProducts });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 휴지통 기능
productController.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        productAt: Date.now(),
      },
      { new: true }
    );
    if (!product) throw new Error("No item found");
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
