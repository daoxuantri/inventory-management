const httpStatus = require("http-status");
const OrdersModel = require("../models/Orders.models");
const ApiError = require("../utils/ApiError");

exports.createOrder = async (req, res, next) => {
  try {
    const { user, body } = req;

    const order = new OrdersModel({
      user,
      consumer: body.user,
      items: body.items,
    });
    const savedOrder = await order.save();

    if (!savedOrder) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Tạo đơn hàng thất bại",
      });
    }

    return res.status(httpStatus.CREATED).send({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: {
        order: {
          _id: savedOrder._id,
          consumer: savedOrder.consumer,
          items: savedOrder.items,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllorders = async (req, res, next) => {
  try {
    const user = req.user;
    const page = req.query?.page || 1;
    const query = req.query?.query || "";
    const limit = 10;
    const perPage = (Number(page) - 1) * limit;

    const queries = {
      user,
      items: {
        $elemMatch: {
          name: { $regex: query, $options: "i" },
        },
      },
    };

    const data = await OrdersModel.find(queries)
      .populate("consumer", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(perPage);

    const documents = await OrdersModel.countDocuments(queries);
    const hasMore = perPage + limit < documents;

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: {
        orders: data,
        hasMore,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { user, params } = req;
    const id = params.id;

    const existOrder = await OrdersModel.findOne({ user, _id: id });

    if (!existOrder) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    await OrdersModel.findByIdAndDelete(existOrder._id);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (err) {
    next(err);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const { user, params } = req;
    const id = params.id;

    const order = await OrdersModel.findOne({ user, _id: id })
      .select("consumer user items createdAt")
      .populate("consumer", "name email address -_id")
      .populate("user", "name -_id");

    if (!order) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Lấy thông tin hóa đơn thành công",
      data: {
        order,
      },
    });
  } catch (err) {
    next(err);
  }
};