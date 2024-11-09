const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Array, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Object, required: true },
    status: { type: String, default: "active" },
    isDeleted: { type: Boolean, default: false },
    productAt: { type: Date, required: true }, // 생성 또는 복구된 시각을 저장
  },
  { timestamps: true }
);
productSchema.method.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj;
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
